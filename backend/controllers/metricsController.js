// Controller to handle web-vitals metrics

const registerINP = (req, res) => {
  const { value } = req.body || {};
  console.log("INP metric received:", value);
  res.json({ success: true });
};

module.exports = { registerINP };

