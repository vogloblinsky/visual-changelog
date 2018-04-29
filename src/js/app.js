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

let headingsWithSemVer = [];
let REPOSITORIES = [];

/*fetch(`./data/final-data.json`)
    .then(response => response.json())
    .then(data => {
        REPOSITORIES = data;
        console.log(REPOSITORIES);
    });*/

fetch(`https://raw.githubusercontent.com/angular/angular/master/CHANGELOG.md`)
    .then(response => response.text())
    .then(data => {
        let _unified = unified().use(markdown);
        let markdownAST = _unified.parse(data);

        markdownAST.children.filter(node => {
            if (node.type === 'heading') {
                let i = 0,
                    nodeChildren = node.children,
                    len = nodeChildren.length,
                    hasSemVer = false,
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
                if (hasSemVer) {
                    i = 0;
                    // Find nodes of type text with text matching date regex
                    for (i; i < len; i++) {
                        if (nodeChildren[i].type === 'text') {
                            let text = nodeChildren[i].value;
                            if (DATE_REGEX().test(text)) {
                                time = text.match(DATE_REGEX())[0];
                            }
                        }
                    }
                    headingsWithSemVer.push({
                        time: time,
                        version: version
                    });
                }
            }
        });

        createGraph();
    });

let createGraph = () => {
    var now = moment()
        .minutes(0)
        .seconds(0)
        .milliseconds(0);

    var groups = new vis.DataSet();
    groups.add({
        id: '0',
        content: 'Angular'
    });

    var items = new vis.DataSet();
    for (var i = 0; i < headingsWithSemVer.length; i++) {
        items.add({
            id: i,
            group: 0,
            content: headingsWithSemVer[i].version,
            start: headingsWithSemVer[i].time,
            type: 'box'
        });
    }

    var container = document.getElementById('visualization');
    var options = {
        groupOrder: 'content',
        min: moment('2016-09-14').subtract(2, 'M'),
        max: moment().add(1, 'M'),
        orientation: {
            axis: 'top',
            item: 'top'
        },
        onInitialDrawComplete: removeSpinner
    };

    var timeline = new vis.Timeline(container, items, options);
    timeline.setGroups(groups);
};

let removeSpinner = () => {
    let spinner = document.querySelector('.spinner');
    spinner.parentNode.removeChild(spinner);
};
