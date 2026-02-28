function ReviewResult({ result }) {
  return (
    <div className="review-output">
      <pre>{result || "AI feedback will appear here..."}</pre>
    </div>
  );
}

export default ReviewResult;