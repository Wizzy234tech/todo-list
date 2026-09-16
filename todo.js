(function () {
  "use strict";

  var KEY = "todo.sage.v1";
  var tasks = [];
  var view = "all";

  var list  = document.getElementById("list");
  var field = document.getElementById("field");
  var tally = document.getElementById("tally");
  var stamp = document.getElementById("stamp");
  var count = document.getElementById("count");
  var sweep = document.getElementById("sweep");

  var WORDS = ["no", "one", "two", "three", "four", "five",
               "six", "seven", "eight", "nine", "ten"];

  /* ── storage ──────────────────────────────────────── */

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        tasks = parsed
          .filter(function (t) { return t && typeof t.text === "string"; })
          .map(function (t) {
            return { id: t.id || uid(), text: t.text, done: !!t.done };
          });
      }
    } catch (e) {
      tasks = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    } catch (e) {
      // Storage blocked or full — the list still works for this session.
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ── derived values ───────────────────────────────── */

  function openCount() {
    return tasks.filter(function (t) { return !t.done; }).length;
  }

  function headline() {
    var n = openCount();
    if (tasks.length === 0) return "Nothing on the list yet.";
    if (n === 0) return "All <em>done</em> for now.";
    var word = n <= 10 ? WORDS[n] : String(n);
    return "<em>" + word + "</em> thing" + (n === 1 ? "" : "s") + " left to do.";
  }

  function today() {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric"
    });
  }

  function visible() {
    return tasks.filter(function (t) {
      if (view === "open") return !t.done;
      if (view === "done") return t.done;
      return true;
    });
  }

  function emptyLine() {
    if (view === "done") return "Nothing finished yet. Tick something off.";
    if (view === "open") return "Your to-do column is clear.";
    return "Add your first task above.";
  }

  /* ── rendering ────────────────────────────────────── */

  function render() {
    tally.innerHTML = headline();
    stamp.textContent = today();

    list.textContent = "";
    var rows = visible();

    if (rows.length === 0) {
      var p = document.createElement("p");
      p.className = "blank";
      p.textContent = emptyLine();
      list.appendChild(p);
    } else {
      rows.forEach(function (task) { list.appendChild(row(task)); });
    }

    var done = tasks.length - openCount();
    count.textContent = tasks.length
      ? openCount() + " to do \u00B7 " + done + " finished"
      : "";
    sweep.hidden = done === 0;
  }

  function row(task) {
    var li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    var tick = document.createElement("button");
    tick.type = "button";
    tick.className = "tick";
    tick.setAttribute("aria-pressed", task.done ? "true" : "false");
    tick.setAttribute("aria-label",
      (task.done ? "Mark unfinished: " : "Mark finished: ") + task.text);
    tick.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 13 9 18 20 6"/></svg>';
    tick.addEventListener("click", function () {
      task.done = !task.done;
      save();
      render();
    });

    var label = document.createElement("button");
    label.type = "button";
    label.className = "label";
    label.textContent = task.text;
    label.title = "Click to edit";
    label.addEventListener("click", function () { edit(li, task, label); });

    var drop = document.createElement("button");
    drop.type = "button";
    drop.className = "drop";
    drop.innerHTML = "&times;";
    drop.setAttribute("aria-label", "Delete: " + task.text);
    drop.addEventListener("click", function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      save();
      render();
    });

    li.appendChild(tick);
    li.appendChild(label);
    li.appendChild(drop);
    return li;
  }

  /* ── actions ──────────────────────────────────────── */

  function edit(li, task, label) {
    var input = document.createElement("input");
    input.type = "text";
    input.className = "edit";
    input.value = task.text;
    input.setAttribute("aria-label", "Edit task");
    li.replaceChild(input, label);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    function commit() {
      var next = input.value.trim();
      if (next) task.text = next;
      save();
      render();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      if (e.key === "Escape") { e.preventDefault(); render(); }
    });
  }

  function add() {
    var text = field.value.trim();
    if (!text) { field.focus(); return; }
    tasks.unshift({ id: uid(), text: text, done: false });
    field.value = "";
    if (view === "done") { view = "all"; syncViews(); }
    save();
    render();
    field.focus();
  }

  function syncViews() {
    var buttons = document.querySelectorAll(".view");
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute("aria-pressed", b.dataset.view === view ? "true" : "false");
    });
  }

  /* ── wiring ───────────────────────────────────────── */

  document.getElementById("add").addEventListener("click", add);

  field.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); add(); }
  });

  Array.prototype.forEach.call(document.querySelectorAll(".view"), function (b) {
    b.addEventListener("click", function () {
      view = b.dataset.view;
      syncViews();
      render();
    });
  });

  sweep.addEventListener("click", function () {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
  });

  load();
  render();
})();