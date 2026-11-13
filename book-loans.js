/* Reusable loan, persistence and form-validation functions. */
const BookLoans = (() => {
  const storageKey = "book-lending-tracker.loans";

  function today() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

  function status(loan, currentDate = today()) {
    if (loan.returned) return "Returned";
    return loan.dueDate < currentDate ? "Overdue" : "On loan";
  }

  function summary(loans) {
    const currentDate = today();
    return {
      total: loans.length,
      overdue: loans.filter(loan => status(loan, currentDate) === "Overdue").length
    };
  }

  function validate(form, messages) {
    const values = {};
    let firstInvalid;

    for (const [name, message] of Object.entries(messages)) {
      const input = form.elements.namedItem(name);
      const value = input.value.trim();
      const invalid = !value || !input.validity.valid;
      const error = form.querySelector("#" + input.id + "-error");

      error.textContent = invalid ? message : "";
      input.setAttribute("aria-invalid", String(invalid));
      if (invalid && !firstInvalid) firstInvalid = input;
      values[name] = value;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }

    return values;
  }

  function load(storage) {
    const saved = storage.getItem(storageKey);
    if (saved === null) return [];
    const loans = JSON.parse(saved);
    if (!Array.isArray(loans)) throw new Error("Invalid loan data");
    return loans;
  }

  function save(storage, loans) {
    storage.setItem(storageKey, JSON.stringify(loans));
  }

  return { status, summary, validate, load, save };
})();
