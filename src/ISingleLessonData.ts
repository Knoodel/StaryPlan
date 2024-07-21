export default interface ISingleLessonData {
  id: number; // Helpful for manual fixes
  classId: string;
  lessonId: string;
  teacherId: string;
  classroomId: string;
  weekdayIndex: number;
  timeIndex: number;
  weekdayName: string,
  timeName: string
}
