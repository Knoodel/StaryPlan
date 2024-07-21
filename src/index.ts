import ISingleLessonData from "./ISingleLessonData";
import Scraper from "./scraper";
import UiUpdater from "./uiUpdater";

const url: string = "https://zsmeie.torun.pl/plan/plany/o1.html";
const scraper: Scraper = new Scraper();

function update(): void {
  const urls: string[] = [];
  for (let i = 1; i <= 33; i++) {
    urls.push(`https://zsmeie.torun.pl/plan/plany/o${i}.html`);
  }

  const promises: Promise<ISingleLessonData[]>[] = urls.map((url) =>
    scraper.getTimetableData(url)
  );

  Promise.all(promises)
    .then((results) => {
      const data: ISingleLessonData[] = ([] as ISingleLessonData[]).concat(
        ...results
      );
      chrome.storage.local
        .set({ timetableData: data })
        .then(() => {
          console.log("Timetable data updated successfully.");
        })
        .catch((error) => {
          console.error("Error setting timetable data: ", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching timetable data: ", error);
    });
}

function updateWebsiteData(): void {
  chrome.storage.local.get("timetableData", (result) => {
    const timetableData: ISingleLessonData[] = result.timetableData;
    if (timetableData.length === 0) {
      return;
    }

    const hours: string[] = [];
    timetableData.forEach(lesson => {
      hours.push(lesson.timeName);
    })

    const uniqueHours = [...new Set(hours)].sort((a, b) => {
      // Extract the start times before the hyphen
      const startTimeA = a.split('-')[0];
      const startTimeB = b.split('-')[0];

      // Split the start times into hours and minutes
      const [hoursA, minutesA] = startTimeA.split(':').map(Number);
      const [hoursB, minutesB] = startTimeB.split(':').map(Number);

      // Convert start times to minutes past midnight
      const timeA = hoursA * 60 + minutesA;
      const timeB = hoursB * 60 + minutesB;

      // Compare the start times
      return timeA - timeB;
    });

    const uiUpdater = new UiUpdater(timetableData, uniqueHours);
    uiUpdater.updateTeachers();

    return;
  });
}

function checkForUpdates() {
  chrome.storage.local.get("lastUpdated", (result) => {
    const currentLastUpdateDate: string = result.lastUpdated;

    scraper
      .getLastUpdatedDate(url)
      .then((newDate) => {
        if (newDate !== currentLastUpdateDate) {
          chrome.storage.local.set({ lastUpdated: newDate }, () => {
            console.log(`Update detected: ${newDate}`);
            update();
          });
        } else {
          console.log("No update needed.");
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  });
}

// Main

// checkForUpdates();
window.addEventListener("load", () => {
  update();
  updateWebsiteData();
});
