async function searchStudent() {
  const roll = document.getElementById("rollInput").value.trim();
  const className = document.getElementById("classInput").value;
  const group = document.getElementById("groupInput").value;
  const exam = document.getElementById("examInput").value;
  const year = document.getElementById("yearInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!roll || !className || !group || !exam || !year) {
    resultDiv.innerHTML = `<p style="color:red;">Please fill in all fields.</p>`;
    return;
  }

  const sheetID = "1nstvK3yI0A8POv1qDBqMptf-RWeifxqwa8Rrgiy5TxU";
  const sheetName = className;
  const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error: " + res.status);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Data is not an array.");

    const student = data.find(item =>
      item["Roll"].toString().trim() === roll &&
      item["Group or Section"].trim().toUpperCase() === group.toUpperCase() &&
      item["Exam"].trim().toLowerCase() === exam.toLowerCase() &&
      (item["Year"] ? item["Year"].trim() === year : true)
    );

    if (!student) {
      resultDiv.innerHTML = `<p style="color:red;">No student found with the given details.</p>`;
      return;
    }

    const failedCount = Number(student["Failed Subject"]);
    const resultText = failedCount === 0
      ? `<span class="result-text passed">Passed</span>`
      : `<span class="result-text failed">Failed (${failedCount} Subject${failedCount > 1 ? "s" : ""})</span>`;

    const gpaWithout = !isNaN(student["GPA (Without 4th)"])
      ? Number(student["GPA (Without 4th)"]).toFixed(2)
      : student["GPA (Without 4th)"];

    const gpaWith = !isNaN(student["GPA (With 4th)"])
      ? Number(student["GPA (With 4th)"]).toFixed(2)
      : student["GPA (With 4th)"];

    resultDiv.innerHTML = `
      <div class="result-container">
        <div class="left">
          <table>
            <tr><th>Name</th><td>${student["Name"]}</td></tr>
            <tr><th>Roll</th><td>${student["Roll"]}</td></tr>
            <tr><th>Exam</th><td>${student["Exam"]}</td></tr>
            <tr><th>Group</th><td>${student["Group or Section"]}</td></tr>
            <tr><th>Class</th><td>${className}</td></tr>
          </table>
        </div>
        <div class="right">
          <table>
            <tr><th>Total Number</th><td>${student["Total Number"]}</td></tr>
            <tr><th>GPA (Without Optional Subject)</th><td>${gpaWithout}</td></tr>
            <tr><th>GPA (Optional Subject)</th><td>${gpaWith}</td></tr>
            <tr><th>Merit</th><td>${student["Merit"]}</td></tr>
            <tr><th>Result</th><td>${resultText}</td></tr>
          </table>
        </div>
      </div>
      <button class="print-btn" onclick="printResult()">Print</button>
    `;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = `<p style="color:red;">Error fetching data. Please try again later.</p>`;
  }
}

function printResult() {
  const resultContent = document.getElementById("result").innerHTML;
  const headerContent = document.querySelector(".header").innerHTML;

  const w = window.open("", "", "width=900,height=700");
  w.document.write(`
    <html>
      <head>
        <title>Student Result</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f0f4f8; }
          h1, p { text-align: center; margin: 0; }
          .result-container { display: flex; gap: 20px; flex-wrap: wrap; justify-content: space-between; }
          .left, .right { flex: 1 1 48%; min-width: 300px; padding: 20px; border-radius: 10px; background-color: #d4edda; box-sizing: border-box; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 14px; }
          th { text-align: left; font-weight: bold; color: #333; background-color: #c3e6cb; width: 45%; padding: 10px; }
          td { font-weight: bold; color: #222; width: 55%; padding: 10px; word-wrap: break-word; }
          .result-text.passed { color: green; font-weight: bold; }
          .result-text.failed { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        ${headerContent}
        <hr style="margin:20px 0;">
        ${resultContent}
      </body>
    </html>
  `);
  w.document.close();
  w.print();
}
