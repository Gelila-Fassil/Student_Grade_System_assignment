
const readline = require("readline/promises");
const { stdin, stdout } = require("process");


const GRADE_SCALE = [
  { min: 90, letter: "A", value: 4.0 },
  { min: 80, letter: "B", value: 3.0 },
  { min: 70, letter: "C", value: 2.0 },
  { min: 60, letter: "D", value: 1.0 },
  { min: 0, letter: "F", value: 0.0 },
];
const MIN_CREDIT = 1;
const MAX_CREDIT = 4;
const MAX_COURSES = 10;

const students = []; 

// ---------- Calculation functions ----------
function getLetterGrade(mark) {
  return GRADE_SCALE.find((g) => mark >= g.min).letter;
}

function getGradeValue(mark) {
  return GRADE_SCALE.find((g) => mark >= g.min).value;
}

function calculateAverage(courses) {
  const total = courses.reduce((sum, c) => sum + c.mark, 0);
  return total / courses.length;
}


function calculateGpa(courses) {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    totalPoints += getGradeValue(c.mark) * c.credit;
    totalCredits += c.credit;
  }
  return totalPoints / totalCredits;
}


let rl;

async function ask(prompt) {
  return (await rl.question(prompt)).trim();
}

async function getStudentName() {
  while (true) {
    const name = await ask("Student name: ");
    if (/^[A-Za-z][A-Za-z .'-]{0,48}$/.test(name)) return name;
    console.log("  Invalid name. Use letters, spaces, . ' - only (max 49 chars).");
  }
}

async function getCourseCount() {
  while (true) {
    const text = await ask(`Number of courses (1-${MAX_COURSES}): `);
    const n = Number(text);
    if (Number.isInteger(n) && n >= 1 && n <= MAX_COURSES) return n;
    console.log(`  Enter a whole number from 1 to ${MAX_COURSES}.`);
  }
}

async function getCourseName(index) {
  while (true) {
    const name = await ask(`  Course ${index} name: `);
    if (name.length >= 1 && name.length <= 30) return name;
    console.log("  Course name must be 1-30 characters.");
  }
}

async function getCreditHour() {
  while (true) {
    const text = await ask(`  Credit hour (${MIN_CREDIT}-${MAX_CREDIT}): `);
    const n = Number(text);
    if (text !== "" && Number.isInteger(n) && n >= MIN_CREDIT && n <= MAX_CREDIT) return n;
    console.log(`  Credit hour must be a whole number from ${MIN_CREDIT} to ${MAX_CREDIT}.`);
  }
}

async function getMark() {
  while (true) {
    const text = await ask("  Mark (0-100): ");
    const n = Number(text);
    if (text !== "" && Number.isFinite(n) && n >= 0 && n <= 100) return n;
    console.log("  Mark must be a number from 0 to 100.");
  }
}


function displayStudent(student) {
  const line = "-".repeat(62);
  console.log("\n" + line);
  console.log(`ID: ${student.id}    Name: ${student.name}`);
  console.log(line);
  console.log(
    "Course".padEnd(30) + "Credit".padStart(7) + "Mark".padStart(8) +
    "Grade".padStart(8) + "Value".padStart(8)
  );
  for (const c of student.courses) {
    console.log(
      c.name.padEnd(30) +
        String(c.credit).padStart(7) +
        c.mark.toFixed(1).padStart(8) +
        getLetterGrade(c.mark).padStart(8) +
        getGradeValue(c.mark).toFixed(1).padStart(8)
    );
  }
  console.log(line);
  const avg = calculateAverage(student.courses);
  console.log(`Average mark : ${avg.toFixed(2)}  (${getLetterGrade(avg)})`);
  console.log(`Weighted GPA : ${calculateGpa(student.courses).toFixed(2)}`);
  console.log(line + "\n");
}


async function addStudent() {
  const id = String(students.length + 1);
  const name = await getStudentName();
  const count = await getCourseCount();
  const courses = [];
  for (let i = 1; i <= count; i++) {
    const cName = await getCourseName(i);
    const credit = await getCreditHour();
    const mark = await getMark();
    courses.push({ name: cName, credit, mark });
  }
  const student = { id, name, courses };
  students.push(student);
  console.log("\nStudent added.");
  displayStudent(student);
}

function viewAll() {
  if (students.length === 0) {
    console.log("\nNo students recorded yet.\n");
    return;
  }
  console.log("\nID".padEnd(12) + "Name".padEnd(24) + "Average".padStart(9) + "Grade".padStart(7) + "GPA".padStart(7));
  for (const s of students) {
    const avg = calculateAverage(s.courses);
    console.log(
      s.id.padEnd(11) + s.name.padEnd(24) + avg.toFixed(2).padStart(9) +
        getLetterGrade(avg).padStart(7) + calculateGpa(s.courses).toFixed(2).padStart(7)
    );
  }
  console.log();
}

async function searchStudent() {
  const id = (await ask("Enter the student ID to search: ")).toUpperCase();
  const found = students.find((s) => s.id === id);
  if (found) displayStudent(found);
  else console.log("\nNo student found with that ID.\n");
}


async function main() {
  rl = readline.createInterface({ input: stdin, output: stdout });
  let running = true;
  while (running) {
    console.log("=== Student Grade Management System ===");
    console.log("1. Add student");
    console.log("2. View all students");
    console.log("3. Search student by ID");
    console.log("4. Exit");
    const choice = await ask("Choose an option (1-4): ");
    if (choice === "1") await addStudent();
    else if (choice === "2") viewAll();
    else if (choice === "3") await searchStudent();
    else if (choice === "4") running = false;
    else console.log("\nInvalid choice. Enter 1, 2, 3 or 4.\n");
  }
  console.log("Goodbye!");
  rl.close();
}

if (require.main === module) {
  main();
}

module.exports = { getLetterGrade, getGradeValue, calculateAverage, calculateGpa };
