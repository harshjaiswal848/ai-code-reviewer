import { jsPDF } from "jspdf";

function ReviewResult({ result }) {
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(result || "No review available", 10, 10);
    doc.save("AI_Code_Review.pdf");
  };

  return (
    <div className="output">
      <div className="output-header">
        <h3>AI Review</h3>
        {result && (
          <button className="download-btn" onClick={downloadPDF}>
            Download PDF
          </button>
        )}
      </div>

      <pre className="output-text">
        {result || "AI response will appear here..."}
      </pre>
    </div>
  );
}

export default ReviewResult;