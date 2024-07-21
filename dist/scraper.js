var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import { load } from "cheerio";
export default class Scraper {
    getLastUpdatedDate(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios.get(url);
                if (response.status === 200) {
                    const html = response.data;
                    const $ = load(html);
                    return $("body > div > table > tbody > tr:nth-child(3) > td.op > table > tbody > tr > td:nth-child(1)")
                        .contents()
                        .first()
                        .text()
                        .split(" ")[1];
                }
                else {
                    console.error("Failed to fetch page:", response.statusText);
                    return "";
                }
            }
            catch (error) {
                console.error("Error fetching page:", error);
                return "";
            }
        });
    }
    getTimetableData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios.get(url);
                if (response.status === 200) {
                    const html = response.data;
                    const $ = load(html);
                    const lessonData = [];
                    const table = $(".tabela");
                    const classId = $(".tytulnapis").text();
                    table.find("tr").each((rowIndex, rowElement) => {
                        if (rowIndex > 0) {
                            $(rowElement)
                                .find("td.l")
                                .each((colIndex, cellElement) => {
                                const lessonId = $(".p", cellElement).text();
                                if (lessonId) {
                                    const teacherId = $(".n", cellElement).text();
                                    const classroomId = $(".s", cellElement).text();
                                    const lesson = {
                                        classId,
                                        lessonId,
                                        teacherId,
                                        classroomId,
                                        weekdayIndex: colIndex,
                                        timeIndex: rowIndex - 1,
                                    };
                                    lessonData.push(lesson);
                                }
                            });
                        }
                    });
                    return lessonData;
                }
                else {
                    console.error("Failed to fetch page:", response.statusText);
                    return [];
                }
            }
            catch (error) {
                console.error("Error fetching page:", error);
                return [];
            }
        });
    }
}
//# sourceMappingURL=scraper.js.map