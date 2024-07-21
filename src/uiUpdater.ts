import ISingleLessonData from "./ISingleLessonData";

export default class UiUpdater {
  constructor(private timetableData: ISingleLessonData[], private hours: string[]) { }

  updateTeachers() {
    const list = window.frames[0].document;
    const listBody = list.body;

    if (!listBody) return;

    const header = list.createElement("h4");
    header.textContent = "Nauczyciele";
    listBody.appendChild(header);

    const teachers: string[] = this.timetableData.map((lesson) => lesson.teacherId);
    const uniqueTeachers = [...new Set(teachers)].sort((a, b) =>
      a.localeCompare(b)
    );

    const ul = list.createElement("ul");
    listBody.appendChild(ul);
    uniqueTeachers.forEach((teacherId) => {
      const li = list.createElement("li");
      const a = list.createElement("a");

      a.href = "";
      a.target = "plan";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        this.updateTimetable("teacherId", teacherId);
      });

      a.textContent = teacherId;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  updateTimetable(key: keyof ISingleLessonData, value: string) {
    const plan = window.frames[1].document;
    const title = plan.querySelector(".tytulnapis");
    if (title) {
      title.textContent = value;
    }
    const filteredLessons = this.timetableData.filter(lesson => lesson[key] === value);

    const table = plan.querySelector(".tabela");
    const tbody = table?.querySelector("tbody");
    if (!tbody) return;

    const newTbody = plan.createElement("tbody");
    const headerRow = tbody.children[0];
    newTbody.appendChild(headerRow);

    const maxRow = filteredLessons.reduce((max, lesson) => {
      return lesson.timeIndex > max ? lesson.timeIndex : max;
    }, 0)

    for (let row = 1; row <= maxRow + 1; row++) {
      const newTr = plan.createElement("tr");

      for (let col = 0; col < 7; col++) {
        const newTd = plan.createElement("td");
        if (col == 0) {
          newTd.classList.add("nr");
          newTd.textContent = row.toString();
          newTr.appendChild(newTd);
          continue;
        }
        if (col == 1) {
          newTd.classList.add("g");
          newTd.textContent = this.hours[row - 1];
          newTr.appendChild(newTd);
          continue;
        }

        newTd.classList.add("l");

        const lesson = filteredLessons.find(lesson => lesson.timeIndex + 1 === row && lesson.weekdayIndex + 2 === col);
        if (lesson) {
          const lessonIdSpan = plan.createElement("span");
          lessonIdSpan.textContent = lesson.lessonId;
          lessonIdSpan.classList.add("p");
          lessonIdSpan.append(" ");
          newTd.appendChild(lessonIdSpan);

          const classIdSpan = plan.createElement("span");
          classIdSpan.textContent = lesson.classId;
          classIdSpan.classList.add("n");
          classIdSpan.append(" ");
          newTd.appendChild(classIdSpan);

          const classroomIdSpan = plan.createElement("span");
          classroomIdSpan.textContent = lesson.classroomId;
          classroomIdSpan.classList.add("s");
          classroomIdSpan.append(" ");
          newTd.appendChild(classroomIdSpan);
        } else {
          newTd.innerHTML = "&nbsp";
        }

        newTr.appendChild(newTd);
      }
      newTbody.appendChild(newTr);
    }

    table?.replaceChild(newTbody, tbody);
  }
}
