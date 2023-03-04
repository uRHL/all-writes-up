function getContributors(){
    const contributorsRaw = document.querySelectorAll('li[class="mb-2 d-flex"]');
    const allContributors = [];
    for (let i = 0; i < contributorsRaw.length; i++) {
        const element = contributorsRaw[i];
        const _url = element.children[1].children[0].href;
        const _username = element.children[1].children[0].children[0].innerText;

        allContributors.push({
            username: _username,
            url: _url
        });
    }
    return allContributors;
}

function getLanguages(){
    const languagesRaw = document.querySelectorAll('a[class="d-inline-flex flex-items-center flex-nowrap Link--secondary no-underline text-small mr-3"]');
    const allLanguages = [];
    for (let i = 0; i < languagesRaw.length; i++) {
        const element = languagesRaw[i];
        const _lan = element.innerText.split('\n')[0];
        const _usage = element.innerText.split('\n')[1];
        allLanguages.push({
            lan: _lan,
            usage: _usage
        });
    }
    return allLanguages;
}

function getLastCommitInfo(){
    const lastCommitRaw = document.querySelector('div[class="js-details-container Details d-flex rounded-top-2 flex-items-center flex-wrap"]');
    const commitInfo = lastCommitRaw.children[1].children[0];
    
    return {
        user: commitInfo.children[0].innerText,
        action: commitInfo.children[1].innerText,
        totalCommits: lastCommitRaw.children[3].innerText.split('\n')[1].trim()
    };
}

function extractRepoInfo() {
    let repoInfo = {
        lastCommit: getLastCommitInfo(),
        contributors: getContributors(),
        languages: getLanguages()
    }
    return repoInfo;
}

console.log(JSON.stringify(extractRepoInfo()));