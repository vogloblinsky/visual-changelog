// Angular : https://raw.githubusercontent.com/angular/angular/master/CHANGELOG.md
// ts-stats : https://raw.githubusercontent.com/compodoc/ts-stats/master/CHANGELOG.md
// parse-changelog test : https://raw.githubusercontent.com/SamyPesse/parse-changelog/master/test/CHANGES.md
// compodoc : https://raw.githubusercontent.com/compodoc/compodoc/develop/CHANGELOG.md
// vue.js : no CHANGELOG.md
// react : https://raw.githubusercontent.com/facebook/react/master/CHANGELOG.md
// fs-extra : https://raw.githubusercontent.com/jprichardson/node-fs-extra/master/CHANGELOG.md
// commander.js : https://raw.githubusercontent.com/tj/commander.js/master/CHANGELOG.md
// request : https://raw.githubusercontent.com/request/request/master/CHANGELOG.md

// keep a changelog : https://raw.githubusercontent.com/olivierlacan/keep-a-changelog/master/CHANGELOG.md

// https://github.com/sindresorhus/semver-regex
const SEMVER_REGEX = () =>
    /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/gi;
const DATE_REGEX = () => /(\d{4})-(\d{2})-(\d{2})/gi;

const GITHUB_BOOK_SVG = '<svg class="octicon octicon-repo" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"></path></svg>'

const ERROR_PARSING_MESSAGE = 
`We could not process correctly the CHANGELOG file.
We easily parse CHANGELOG that respect https://keepachangelog.com convention.
`;
const ERROR_FETCH_MESSAGE = 'Could not fetch the CHANGELOG file.';

let headingsWithSemVer = [];
let REPOSITORIES = [];
let ORDERED_REPOSITORIES = [];
let choicesItems = [];
let choiceSelectReference;
let timelineReference;

let repositoryDropdown = document.getElementById('repository-dropdown');

let uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));

fetch(`./data/changelogswithstars.json`)
    .then(response => response.json())
    .then(data => {
        REPOSITORIES = uniqueArray(data);
        ORDERED_REPOSITORIES = orderRepositoriesByStars();
        
        console.log(ORDERED_REPOSITORIES);

        prepareDataForChoiceSelect();
        createChoiceSelect('stars');
    });

let prepareDataForChoiceSelect = () => {
    choicesItems = ORDERED_REPOSITORIES.map((repo) => {
        let repoOwner = repo.name.split('/')[0];
        let repoName = repo.name.split('/')[1];
        return {
            value: repo.name,
            label: repoOwner + ' / ' + repoName,
            selected: false,
            disabled: false,
            customProperties: {
                stars: parseInt(repo.stars),
                name: repoName,
                owner: repoOwner
            }
        }
    });
    choicesItems.unshift({
        value: '',
        label: 'Select or find a repository',
        placeholder: true,
        disabled: true,
        selected: false
    });
    
    if (choiceSelectReference) {
        choiceSelectReference.destroy();
    }
}

let createChoiceSelect = (filter) => {
    let sortFilterMethod;
    if (filter === 'stars') {
        sortFilterMethod = function(a, b) {
            if (typeof a.customProperties !== 'undefined' && typeof b.customProperties !== 'undefined') {
                return (a.customProperties.stars !== b.customProperties.stars ? (a.customProperties.stars < b.customProperties.stars ? 1 : -1) : 0);
            } else {
                return 0;
            }
        }
    } else {
        sortFilterMethod = function(a, b) {
            return (a.customProperties.name !== b.customProperties.name ? (a.customProperties.name > b.customProperties.name ? 1 : -1) : 0);
        }
    }
    choiceSelectReference = new Choices(repositoryDropdown, {
        itemSelectText: '',
        choices: choicesItems,
        placeholderValue: 'Please Choose…',
        sortFilter: sortFilterMethod,
        shouldSort: false,
        callbackOnCreateTemplates: function(template) {
            var classNames = this.config.classNames;
            return {
                item: data => {
                    if (data.customProperties) {
                            return template(`
                            <div class="${classNames.item} ${
                                    data.highlighted
                                        ? classNames.highlightedState
                                        : classNames.itemSelectable
                                }" data-item data-id="${data.id}" data-value="${
                                    data.value
                                }" ${data.active ? 'aria-selected="true"' : ''} ${
                                    data.disabled ? 'aria-disabled="true"' : ''
                                }>
                                ${GITHUB_BOOK_SVG}<span class="repo-name">${data.label}</span>&nbsp;<span class="list-stars list-stars-selected">${data.customProperties.stars} &#9733;</span>
                            </div>
                        `);
                    } else {
                        return template(`
                        <div class="${classNames.item} ${classNames.itemChoice} ${
                                data.disabled
                                    ? classNames.itemDisabled
                                    : classNames.itemSelectable
                            }" data-select-text="${
                                this.config.itemSelectText
                            }" data-choice ${
                                data.disabled
                                    ? 'data-choice-disabled aria-disabled="true"'
                                    : 'data-choice-selectable'
                            } data-id="${data.id}" data-value="${data.value}" ${
                                data.groupId > 0
                                    ? 'role="treeitem"'
                                    : 'role="option"'
                            }>
                            <span>${data.label}</span>
                        </div>
                    `);
                    }
                },
                choice: data => {
                    if (data.customProperties) {
                        return template(`
                            <div class="${classNames.item} ${classNames.itemChoice} ${
                                    data.disabled
                                        ? classNames.itemDisabled
                                        : classNames.itemSelectable
                                }" data-select-text="${
                                    this.config.itemSelectText
                                }" data-choice ${
                                    data.disabled
                                        ? 'data-choice-disabled aria-disabled="true"'
                                        : 'data-choice-selectable'
                                } data-id="${data.id}" data-value="${data.value}" ${
                                    data.groupId > 0
                                        ? 'role="treeitem"'
                                        : 'role="option"'
                                }>
                                ${GITHUB_BOOK_SVG}<span class="repo-name">${data.label}</span>&nbsp;<span class="list-stars">${data.customProperties.stars} &#9733;</span>
                            </div>
                        `);
                    } else {
                        return template(`
                            <div class="${classNames.item} ${classNames.itemChoice} ${
                                    data.disabled
                                        ? classNames.itemDisabled
                                        : classNames.itemSelectable
                                }" data-select-text="${
                                    this.config.itemSelectText
                                }" data-choice ${
                                    data.disabled
                                        ? 'data-choice-disabled aria-disabled="true"'
                                        : 'data-choice-selectable'
                                } data-id="${data.id}" data-value="${data.value}" ${
                                    data.groupId > 0
                                        ? 'role="treeitem"'
                                        : 'role="option"'
                                }>
                                <span class="repo-name">${data.label}</span>
                            </div>
                        `);
                    }
                }
            };
        }
    });
}

let orderRepositoriesAlphabetically = () => {
    return REPOSITORIES.sort(
        (a, b) =>
            a.name.split('/')[1] !== b.name.split('/')[1]
                ? a.name.split('/')[1] < b.name.split('/')[1]
                    ? -1
                    : 1
                : 0
    );
};
let orderRepositoriesByStars = () => {
    return REPOSITORIES.sort(
        (a, b) => (a.stars !== b.stars ? (a.stars < b.stars ? 1 : -1) : 0)
    );
};

let fetchChangelog = repository => {
    function handleErrors(response) {
        if (!response.ok) {
            notifier.show(
                'Oups !',
                ERROR_FETCH_MESSAGE,
                'danger',
                '',
                3000
            );
            throw Error(response.statusText);
        }
        return response;
    }
    fetch(`https://raw.githubusercontent.com/${repository}/master/CHANGELOG.md`)
        .then(handleErrors)
        .then(response => response.text())
        .then(data => {
            // console.log(data);
            processChangelog(data);
        })
        .catch(error => console.log(error));
};

document.querySelector('select').addEventListener('change', event => {
    let repositoryName = event.currentTarget.value;
    if (timelineReference) {
        timelineReference.destroy();
    }
    displayVizualisation();
    showSpinner();
    fetchChangelog(repositoryName);
});

let displayVizualisation = () => {
    document.getElementById('visualization').style.display = 'block';
}

let processChangelog = (data) => {
    let _unified = unified().use(markdown);
    let markdownAST = _unified.parse(data);

    headingsWithSemVer = [];

    markdownAST.children.filter(node => {
        if (node.type === 'heading') {
            let i = 0,
                nodeChildren = node.children,
                len = nodeChildren.length,
                hasSemVer = false,
                hasTime = false,
                version = '',
                time = '';
            // Find nodes of type link with text matching semver regex
            for (i; i < len; i++) {
                if (nodeChildren[i].type === 'link') {
                    let link = nodeChildren[i].children[0];
                    if (SEMVER_REGEX().test(link.value)) {
                        hasSemVer = true;
                        version = link.value;
                    }
                }
            }
            // if no luck with link, try find direct text node
            if (!hasSemVer) {
                i = 0;
                for (i; i < len; i++) {
                    if (nodeChildren[i].type === 'text') {
                        let text = nodeChildren[i].value;
                        if (SEMVER_REGEX().test(text)) {
                            hasSemVer = true;
                            version = text.match(SEMVER_REGEX())[0];
                        }
                    }
                }
            }
            if (hasSemVer) {
                i = 0;
                // Find nodes of type text with text matching date regex
                for (i; i < len; i++) {
                    if (nodeChildren[i].type === 'text') {
                        let text = nodeChildren[i].value;
                        if (DATE_REGEX().test(text)) {
                            time = text.match(DATE_REGEX())[0];
                            hasTime = true;
                        }
                    }
                }
                if (hasTime) {
                    headingsWithSemVer.push({
                        time: time,
                        version: version
                    });
                }
            }
        }
    });

    if (headingsWithSemVer.length === 0) {
        notifier.show(
            'Sorry !',
            ERROR_PARSING_MESSAGE,
            'warning',
            '',
            3000
        );
        hideSpinner();
    }

    createGraph();
}

/*fetch(`https://raw.githubusercontent.com/angular/angular/master/CHANGELOG.md`)
    .then(response => response.text())
    .then(data => {
        
    });*/

let createGraph = () => {
    let now = moment()
        .minutes(0)
        .seconds(0)
        .milliseconds(0);

    let groups = new vis.DataSet();
    groups.add({
        id: '0',
        content: ''
    });

    let items = new vis.DataSet();
    let minDate = moment();
    for (let i = 0; i < headingsWithSemVer.length; i++) {
        let momentTime = moment(headingsWithSemVer[i].time);
        if (moment(momentTime).isBefore(minDate)) {
            minDate = momentTime
        }
        items.add({
            id: i,
            group: 0,
            content: headingsWithSemVer[i].version,
            start: headingsWithSemVer[i].time,
            type: 'box'
        });
    }

    let container = document.getElementById('visualization');
    let options = {
        groupOrder: 'content',
        min: minDate.subtract(2, 'M'),
        max: moment().add(1, 'M'),
        orientation: {
            axis: 'top',
            item: 'top'
        },
        zoomMin: 1000 * 60 * 60 * 24 * 7 * 4, // one month in milliseconds
        onInitialDrawComplete: hideSpinner
    };

    timelineReference = new vis.Timeline(container, items, options);
    timelineReference.setGroups(groups);
};

let spinner = document.querySelector('.spinner');
let hideSpinner = () => {
    //spinner.parentNode.removeChild(spinner);
    spinner.style.display = 'none';
};
let showSpinner = () => {
    spinner.style.display = 'block';
}

/**
 * Order buttons
 */

let cleanOrderButtonsState = () => {
    [...document.querySelectorAll('.order-buttons')].map(button => {
        button.classList.remove('selected');
    });
};

[...document.querySelectorAll('.order-buttons')].map(button => {
    button.addEventListener('click', event => {
        cleanOrderButtonsState();
        event.currentTarget.classList.add('selected');
        let dataOrder = event.currentTarget.getAttribute('data-order');
        let orderType = '';
        if (dataOrder === 'asc') {
            ORDERED_REPOSITORIES = orderRepositoriesAlphabetically();
            orderType = 'asc';
        } else {
            ORDERED_REPOSITORIES = orderRepositoriesByStars();
            orderType = 'stars';
        }
        prepareDataForChoiceSelect();
        createChoiceSelect(orderType);
    });
});
