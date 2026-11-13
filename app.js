function startLoanTracker() {
  const form = document.querySelector("#loan-form");
  const rows = document.querySelector("#loan-rows");
  const total = document.querySelector("#total-loans");
  const overdue = document.querySelector("#overdue-loans");
  const storageError = document.querySelector("#storage-error");
  const messages = {
    title: "Enter the book title.",
    author: "Enter the author's name.",
    borrower: "Enter the borrower's name.",
    dueDate: "Enter a valid due date.",
    genre: "Enter the book genre."
  };

  let loans;

  try {
    loans = BookLoans.load(window.localStorage);
  } catch {
    storageError.textContent = "Could not load saved loans. Check browser storage and reload the page.";
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  function saveLoans(nextLoans) {
    try {
      BookLoans.save(window.localStorage, nextLoans);
      loans = nextLoans;
      storageError.textContent = "";
      render();
      return true;
    } catch {
      storageError.textContent = "Could not save the change. Check browser storage and try again.";
      return false;
    }
  }

  function render() {
    const counts = BookLoans.summary(loans);
    total.textContent = counts.total;
    overdue.textContent = counts.overdue;
    rows.replaceChildren();

    if (!loans.length) {
      const cell = rows.insertRow().insertCell();
      cell.colSpan = 7;
      cell.className = "empty-state";
      cell.textContent = "No loans yet.";
      return;
    }

    loans.forEach((loan, index) => {
      const row = rows.insertRow();
      for (const value of [loan.title, loan.author, loan.borrower, loan.dueDate, loan.genre]) {
        row.insertCell().textContent = value;
      }

      const status = BookLoans.status(loan);
      const badge = document.createElement("span");
      badge.className = "status status-" + status.toLowerCase().replace(" ", "-");
      badge.textContent = status;
      row.insertCell().append(badge);

      const action = row.insertCell();
      if (loan.returned) {
        action.tabIndex = -1;
        action.textContent = "—";
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "button";
      button.textContent = "Mark returned";
      button.setAttribute("aria-label", "Mark " + loan.title + " returned");
      button.addEventListener("click", () => {
        const updated = loans.map((item, position) =>
          position === index ? { ...item, returned: true } : item
        );
        if (saveLoans(updated)) rows.rows[index].cells[6].focus();
      });
      action.append(button);
    });
  }

  form.addEventListener("input", event => {
    const input = event.target;
    if (input.getAttribute("aria-invalid") === "true" && input.value.trim() && input.validity.valid) {
      input.setAttribute("aria-invalid", "false");
      form.querySelector("#" + input.id + "-error").textContent = "";
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = BookLoans.validate(form, messages);
    if (values && saveLoans([...loans, { ...values, returned: false }])) form.reset();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
  render();
}

startLoanTracker();
