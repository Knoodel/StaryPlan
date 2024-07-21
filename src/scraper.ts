import axios, { AxiosResponse } from "axios";
import { Cheerio, CheerioAPI, Element, load } from "cheerio";
import ISingleLessonData from "./ISingleLessonData";

export default class Scraper {
  async getLastUpdatedDate(url: string): Promise<string> {
    try {
      const response: AxiosResponse<string> = await axios.get(url);
      if (response.status === 200) {
        const html: string = response.data;
        const $: CheerioAPI = load(html);
        return $(
          "body > div > table > tbody > tr:nth-child(3) > td.op > table > tbody > tr > td:nth-child(1)"
        )
          .contents()
          .first()
          .text()
          .split(" ")[1];
      } else {
        console.error("Failed to fetch page:", response.statusText);
        return "";
      }
    } catch (error: any) {
      console.error("Error fetching page:", error);
      return "";
    }
  }
  async getTimetableData(url: string): Promise<ISingleLessonData[]> {
    try {
      const response: AxiosResponse<string> = await axios.get(url);
      if (response.status === 200) {
        const html: string = response.data;
        const $: CheerioAPI = load(html);

        const lessonData: ISingleLessonData[] = [];

        const table: Cheerio<Element> = $(".tabela");
        const classId: string = $(".tytulnapis").text();

        const weekdayNames: string[] = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

        let id: number = 0;
        table.find("tr").each((rowIndex: number, rowElement: Element) => {
          if (rowIndex > 0) {
            const timeName: string = $(rowElement).find(".g").text();
            $(rowElement)
              .find("td.l")
              .each((colIndex: number, cellElement: Element) => {
                let lessonIdElements: Cheerio<Element> = $(".p", cellElement);
                let teacherIdElements: Cheerio<Element> = $(".n", cellElement);

                // Treat #id as a teacher
                const troublesomeGuy: Cheerio<Element> = lessonIdElements.filter((index, elem) =>
                  $(elem).text().startsWith("#")
                );
                if (troublesomeGuy) {
                  lessonIdElements = lessonIdElements.not(troublesomeGuy);
                  teacherIdElements = troublesomeGuy.add(teacherIdElements);
                }

                let classromIdElements: Cheerio<Element> = $(".s", cellElement);
                for (let i = 0; i < lessonIdElements.length; i++) {
                  const lessonId = lessonIdElements.eq(i).text();
                  const teacherId = teacherIdElements.eq(i).text();
                  const classroomId = classromIdElements.eq(i).text();
                  const lesson: ISingleLessonData = {
                    id,
                    classId,
                    lessonId,
                    teacherId,
                    classroomId,
                    weekdayIndex: colIndex,
                    timeIndex: rowIndex - 1,
                    weekdayName: weekdayNames[colIndex],
                    timeName
                  };
                  lessonData.push(lesson);
                  id++;
                }
              });
          }
        });

        return lessonData;
      } else {
        console.error("Failed to fetch page:", response.statusText);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching page:", error);
      return [];
    }
  }
}
