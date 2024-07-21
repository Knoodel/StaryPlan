import Scraper from "./scraper";
const url = "https://zsmeie.torun.pl/plan/plany/o1.html";
const scraper = new Scraper();
function update() {
    const urls = [];
    for (let i = 1; i <= 33; i++) {
        urls.push(`https://zsmeie.torun.pl/plan/plany/o${i}.html`);
    }
    const promises = urls.map((url) => scraper.getTimetableData(url));
    Promise.all(promises)
        .then((results) => {
        const data = [].concat(...results);
        chrome.storage.local
            .set({ timetableData: data })
            .then(() => {
            console.log("Timetable data updated successfully.");
            chrome.storage.local.get(console.log);
        })
            .catch((error) => {
            console.error("Error setting timetable data: ", error);
        });
    })
        .catch((error) => {
        console.error("Error fetching timetable data: ", error);
    });
}
function updateWebsiteData() {
    chrome.storage.local.get("timetableData", (result) => {
        const timetableData = result.timetableData;
        if (timetableData.length === 0) {
            return;
        }
        const body = document.querySelector("html > frameset > frame:nth-child(2) > html > body");
        if (body) {
            body.appendChild(document.createTextNode("Hello, world!"));
        }
    });
}
updateWebsiteData();
chrome.storage.local.get("lastUpdated", function (result) {
    const currentLastUpdateDate = result.lastUpdated;
    scraper
        .getLastUpdatedDate(url)
        .then((newDate) => {
        if (newDate !== currentLastUpdateDate) {
            chrome.storage.local.set({ lastUpdated: newDate }, () => {
                console.log(`Update detected: ${newDate}`);
                update();
            });
        }
        else {
            console.log("No update needed.");
        }
    })
        .catch((error) => {
        console.error("Error: ", error);
    });
});
//# sourceMappingURL=index.js.map