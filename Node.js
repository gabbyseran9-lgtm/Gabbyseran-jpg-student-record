const fs = require("fs");

// Read students.json
const students = JSON.parse(
    fs.readFileSync("students.json", "utf8")
);

// 1. Get average grade of a student
function getAverageGrade(student) {
    if (!student.grades || student.grades.length === 0) {
        return 0;
    }

    return student.grades.reduce((sum, grade) => sum + grade, 0)
        / student.grades.length;
}

// 2. Get top N students
function getTopStudents(students, n) {
    if (n < 0) {
        throw new Error("Number of students cannot be negative.");
    }

    return students
        .map(student => ({
            ...student,
            averageGrade: getAverageGrade(student)
        }))
        .sort((a, b) => b.averageGrade - a.averageGrade)
        .slice(0, n);
}

// 3. Group students by course
function groupByCourse(students) {
    return students.reduce((groups, student) => {
        if (!groups[student.course]) {
            groups[student.course] = [];
        }

        groups[student.course].push({ ...student });
        return groups;
    }, {});
}

// 4. Get enrolled vs not enrolled count
function getEnrolledCount(students) {
    return students.reduce(
        (count, student) => {
            if (student.enrolled) {
                count.enrolled++;
            } else {
                count.notEnrolled++;
            }

            return count;
        },
        { enrolled: 0, notEnrolled: 0 }
    );
}

// 5. Find a student by name
function findStudent(students, name) {
    if (!name || !Array.isArray(students)) {
        return null;
    }

    return students.find(
        student =>
            student.name.toLowerCase() === name.toLowerCase()
    ) || null;
}

// 6. Get average grade per course
function getCourseAverages(students) {
    const courseData = students.reduce((courses, student) => {
        if (!courses[student.course]) {
            courses[student.course] = [];
        }

        if (student.grades && student.grades.length > 0) {
            courses[student.course].push(...student.grades);
        }

        return courses;
    }, {});

    return Object.entries(courseData)
        .map(([course, grades]) => ({
            course,
            averageGrade:
                grades.length > 0
                    ? grades.reduce((sum, grade) => sum + grade, 0) /
                      grades.length
                    : 0
        }))
        .sort((a, b) => b.averageGrade - a.averageGrade);
}

// 7. Export summary
function exportSummary(students) {
    const totalStudents = students.length;

    const allGrades = students.flatMap(student => student.grades || []);

    const overallAverage =
        allGrades.length > 0
            ? allGrades.reduce((sum, grade) => sum + grade, 0) /
              allGrades.length
            : 0;

    const topStudent =
        getTopStudents(students, 1)[0] || null;

    return {
        totalStudents,
        overallAverage: Number(overallAverage.toFixed(2)),
        topPerformingStudent: topStudent
            ? {
                  id: topStudent.id,
                  name: topStudent.name,
                  averageGrade: Number(
                      topStudent.averageGrade.toFixed(2)
                  )
              }
            : null,
        breakdownByCourse: getCourseAverages(students)
    };
}

// Main function
function main() {
    console.log("======================================");
    console.log("     STUDENT RECORDS DATA REPORT");
    console.log("======================================");

    // Total students
    console.log("\nTOTAL STUDENTS:");
    console.log(students.length);

    // Overall average
    const summary = exportSummary(students);

    console.log("\nOVERALL AVERAGE GRADE:");
    console.log(summary.overallAverage);

    // Top students
    console.log("\nTOP 3 STUDENTS:");

    const topStudents = getTopStudents(students, 3);

    if (topStudents.length === 0) {
        console.log("No students found.");
    } else {
        topStudents.forEach((student, index) => {
            console.log(
                `${index + 1}. ${student.name} - Average: ${student.averageGrade.toFixed(2)}`
            );
        });
    }

    // Course averages
    console.log("\nAVERAGE GRADE BY COURSE:");

    const courseAverages = getCourseAverages(students);

    if (courseAverages.length === 0) {
        console.log("No course data available.");
    } else {
        courseAverages.forEach(course => {
            console.log(
                `${course.course}: ${course.averageGrade.toFixed(2)}`
            );
        });
    }

    // Enrollment count
    console.log("\nENROLLMENT COUNT:");

    const enrolledCount = getEnrolledCount(students);

    console.log(`Enrolled: ${enrolledCount.enrolled}`);
    console.log(`Not Enrolled: ${enrolledCount.notEnrolled}`);

    // Example student search
    console.log("\nSTUDENT SEARCH:");

    const searchResult = findStudent(
        students,
        students.length > 0 ? students[0].name : ""
    );

