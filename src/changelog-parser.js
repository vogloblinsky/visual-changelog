(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.changelog = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Release = require('@release-notes/node/lib/models/Release');
const ReleaseNotes = require('@release-notes/node/lib/models/ReleaseNotes');

const MODIFICATION_TYPE_MAP = {
  security: 'secured',
  updated: 'changed',
  improvements: 'improved',
  'new features': 'added',
  'bug fixes': 'fixed',
  new: 'added',
  'new!!!': 'added',
};
const LINK_REGEX = /^\[([^\]]+)]:\s*(.+)$/;
const RELEASE_HEADER_REGEX = /^\[?([\w\d.-]+\.[\w\d.-]+[a-zA-Z0-9]|Unreleased|Upcoming|Next)]?(?:\s*[^\w(]+\s*(?:\((.+)\)|(.+)))?$/;
const MODIFICATION_LIST_SPLIT_REGEX = /^-\s|^\*\s|\n+-\s|\n+\*\s/m;

function getParentContext(context, section) {
  if (context.isRoot || context.level < section.level) {
    return context;
  }

  // context h1 section h2 -> return h1
  // context h2 section h1 -> root
  // contect h1 section h3 -> return h1
  // context h3 section h1 -> h

  let ctx = context;
  while (ctx.level && ctx.level >= section.level) {
    ctx = ctx.parent;
  }

  return ctx;
}

function parseModificationType(modification) {
  let modificationType = 'changed';

  if (modification.match(/^add/i)) {
    modificationType = 'added';
  } else if (modification.match(/^fix/i)) {
    modificationType = 'fixed';
  } else if (modification.match(/^improve/i)) {
    modificationType = 'improved';
  }

  return modificationType;
}

function buildTree(markdown) {
  const lines = markdown.split('\n');
  const tree = {
    isRoot: true,
    level: 0,
    children: [],
    content: '',
    links: {},
  };
  let context = tree.children;
  context.parent = tree;
  context.root = tree;
  context.content = '';
  context.children = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine[0] === '#') {
      if (trimmedLine.startsWith('# ')) {
        const section = {
          title: trimmedLine.substr(2),
          level: 1,
          children: [],
          content: '',
          parent: tree,
        };
        tree.children.push(section);
        context = section;
      } else if (trimmedLine.startsWith('## ')) {
        const section = {
          title: trimmedLine.substr(3),
          level: 2,
          content: '',
          children: [],
        };
        section.parent = getParentContext(context, section);
        section.parent.children.push(section);
        context = section;
      } else if (trimmedLine.startsWith('### ')) {
        const section = {
          title: trimmedLine.substr(4),
          level: 3,
          content: '',
          children: [],
        };
        section.parent = getParentContext(context, section);
        section.parent.children.push(section);
        context = section;
      } else if (trimmedLine.startsWith('#### ')) {
        const section = {
          title: trimmedLine.substr(5),
          level: 3,
          content: '',
          children: [],
        };
        section.parent = getParentContext(context, section);
        section.parent.children.push(section);

        context = section;
      } else {
        console.warn('Cannot handle title line. Treat it as normal content.', line);
        context.content += `${trimmedLine}\n`;
      }
    } else if (trimmedLine[0] === '[') {
      const link = trimmedLine.match(LINK_REGEX);

      if (link) {
        tree.links[link[1]] = link[2];
      }
    } else {
      context.content += `${line}\n`;
    }
  });

  return tree;
}

function parseModifications(nodes) {
  const parsedModifications = [];

  nodes.forEach((modificationNode) => {
    let modificationType = (modificationNode.title || '').toLowerCase();
    if (modificationType in MODIFICATION_TYPE_MAP) {
      modificationType = MODIFICATION_TYPE_MAP[modificationType];
    }
    const isKnownModificationType = Release.MODIFICATION_TYPES.includes(modificationType);
    const modifications = (modificationNode.content || '').split(MODIFICATION_LIST_SPLIT_REGEX);

    modifications.forEach((modification) => {
      const trimmedModification = modification.trim();

      if (trimmedModification) {
        if (isKnownModificationType) {
          parsedModifications.push({ type: modificationType, modification: trimmedModification });
        } else {
          const tag = modificationType;

          const parsedModificationType = parseModificationType(trimmedModification);
          parsedModifications.push({ type: parsedModificationType, modification: {
            title: trimmedModification,
            tags: [tag],
          }});
        }
      }
    });
  });

  return parsedModifications;
}

function parseReleases(nodes) {
  const releases = [];

  nodes.forEach((releaseNode) => {
    const parsedTitle = releaseNode.title && releaseNode.title.match(RELEASE_HEADER_REGEX);

    if (parsedTitle) {
      const parsedVersion = parsedTitle[1];
      const parsedDate = parsedTitle[2] || parsedTitle[3] || null;
      const releaseDate = new Date(parsedDate);
      let releaseDescription = (releaseNode.content || '').trim();
      let releaseTitle = '';
      const releaseDescriptionLines = releaseDescription.split('\n');

      if (releaseDescriptionLines[0].startsWith('**') && releaseDescriptionLines[0].endsWith('**')) {
        releaseTitle = releaseDescriptionLines.shift().replace(/\*/g, '');
      }

      const release = new Release({
        version: parsedVersion,
        description: releaseDescriptionLines.join('\n').trim(),
        title: releaseTitle,
      });

      if (releaseDate && !['Unreleased', 'Upcoming', 'Next'].includes(parsedVersion)) {
        release.date = releaseDate === 'Invalid Date' ? (new Date(0)).toISOString() : releaseDate.toISOString();
      }

      const modifications = parseModifications(releaseNode.children || []);
      modifications.forEach(modification => release.addModification(modification.type, modification.modification));

      releases.push(release);
    } else {
      console.warn('Unable to parse version and date from release', releaseNode.title);
    }
  });

  return releases;
}

function parse(markdown) {
  if (/^# |^## /gm.test(markdown) === false && /^=+$|^-+$/gm.test(markdown)) {
    markdown = markdown.replace(/^(.+)\s+(^=+$|^-+$)/mg, '## $1');
  }

  const tree = buildTree(markdown);
  const releaseNotesNode = tree.children[0] || tree.children || {};

  const releaseNotes = new ReleaseNotes({
    title: releaseNotesNode.title,
    description: (releaseNotesNode.content || '').trim(),
    releases: parseReleases((releaseNotesNode.children || [])),
  });

  return releaseNotes;
}

module.exports = { parse };

},{"@release-notes/node/lib/models/Release":2,"@release-notes/node/lib/models/ReleaseNotes":3}],2:[function(require,module,exports){
'use strict';

const MODIFICATION_TYPES = [
  'added',
  'removed',
  'changed',
  'improved',
  'deprecated',
  'fixed',
  'secured',
];

class Release {
  /**
   * The list of supported modification types.
   *
   * @static
   * @return {string[]}
   */
  static get MODIFICATION_TYPES() {
    return MODIFICATION_TYPES;
  }

  /**
   * Create new release instance.
   *
   * @param {Object} properties
   */
  constructor(properties = {}) {
    this.date = properties.date || '';
    this.description = properties.description || '';
    this.title = properties.title || '';
    this.version = properties.version || '';

    // modifications
    this.added = properties.added || [];
    this.removed = properties.removed || [];
    this.changed = properties.changed || [];
    this.improved = properties.improved || [];
    this.deprecated = properties.deprecated || [];
    this.fixed = properties.fixed || [];
    this.secured = properties.secured || [];
  }

  /**
   * Append a new modification entry to the list.
   *
   * @param {string} type
   * @param {string|object} modification
   * @return {Release}
   */
  addModification(type, modification) {
    const generalizedType = type.toLowerCase();

    if (Release.MODIFICATION_TYPES.indexOf(generalizedType) === -1) {
      throw new Error('Invalid modification type');
    }

    this[generalizedType].push(modification);

    return this;
  }

  /**
   * Returns a hash of all modifications indexed by modification type.
   *
   * @see Release.MODIFICATION_TYPES
   * @return {object}
   */
  getModifications() {
    const modifications = {};

    Release.MODIFICATION_TYPES.forEach((type) => {
      if (this[type] && this[type].length) {
        modifications[type] = this[type];
      }
    });

    return modifications;
  }

  /**
   * Returns a hash of all the meta information of the release.
   *
   * @return {Object}
   */
  getMetaInfo() {
    const metaInfo = {
      version: this.version,
    };

    ['date', 'title', 'description'].forEach((prop) => {
      if (this[prop]) {
        metaInfo[prop] = this[prop];
      }
    });

    return metaInfo;
  }

  /**
   * Map the release instance to a plain object.
   *
   * @return {Object}
   */
  toJSON() {
    return Object.assign(this.getMetaInfo(), this.getModifications());
  }

  /**
   * Create a new Release instance from plain object.
   *
   * @param {Object} document
   * @return {Release}
   */
  static fromJSON(document) {
    return new Release({
      date: document.date,
      description: document.description,
      title: document.title,
      version: document.version,
      added: document.added,
      removed: document.removed,
      changed: document.changed,
      improved: document.improved,
      deprecated: document.deprecated,
      fixed: document.fixed,
      secured: document.secured,
    });
  }
}

module.exports = Release;

},{}],3:[function(require,module,exports){
'use strict';

const Release = require('./Release');

class ReleaseNotes {
  constructor(properties = {}) {
    this.description = properties.description || '';
    this.title = properties.title || '';
    this.releases = properties.releases || [];
  }

  /**
   * Map the release notes instance into a plain object.
   *
   * @return {Object}
   */
  toJSON() {
    return {
      title: this.title,
      description: this.description,
      releases: this.releases.map(r => r.toJSON()),
    };
  }

  /**
   * Naive approach. Simply add the release as first item to the list of releases.
   *
   * @param release
   * @return {ReleaseNotes}
   */
  addRelease(release) {
    this.releases.unshift(release);

    return this;
  }

  /**
   * @param {string} version
   * @return {Release|undefined}
   */
  findReleaseByVersion(version) {
    return this.releases.find(release => release.version === version);
  }

  /**
   * Create a new release notes instance from plain object.
   *
   * @param {Object} document
   * @return {ReleaseNotes}
   */
  static fromJSON(document) {
    const releases = document.releases
      ? document.releases.map(r => Release.fromJSON(r))
      : [];

    return new ReleaseNotes({
      title: document.title,
      description: document.description,
      releases,
    });
  }
}

module.exports = ReleaseNotes;


},{"./Release":2}]},{},[1])(1)
});
