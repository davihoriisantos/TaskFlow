// TaskFlow - gerenciamento de tarefas com JavaScript puro e localStorage.

const STORAGE_KEY = "taskflow_tarefas";
let tasks = [];
let editingId = null;
let toastTimer;

const elements = {
  total: document.getElementById("total-count"),
  pending: document.getElementById("pending-count"),
  progress: document.getElementById("progress-count"),
  done: document.getElementById("done-count"),
  dialog: document.getElementById("task-dialog"),
  form: document.getElementById("task-form"),
  title: document.getElementById("task-title"),
  description: document.getElementById("task-description"),
  priority: document.getElementById("task-priority"),
  due: document.getElementById("task-due"),
  status: document.getElementById("task-status"),
  dialogTitle: document.getElementById("dialog-title"),
  error: document.getElementById("form-error"),
  search: document.getElementById("search-input"),
  priorityFilter: document.getElementById("priority-filter"),
  statusFilter: document.getElementById("status-filter"),
  toast: document.getElementById("toast")
};

const statusNames = {
  pendente: "A Fazer",
  andamento: "Em Andamento",
  concluida: "Concluída"
};

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      tasks = [];
      return;
    }
    const parsed = JSON.parse(saved);
    tasks = Array.isArray(parsed) ? parsed.filter(isValidTask) : [];
  } catch (error) {
    tasks = [];
    showToast("Não foi possível carregar os dados salvos.");
    console.error("Erro ao ler tarefas do localStorage:", error);
  }
}

function isValidTask(task) {
  return task && typeof task.id === "string" &&
    typeof task.title === "string" &&
    ["baixa", "media", "alta"].includes(task.priority) &&
    ["pendente", "andamento", "concluida"].includes(task.status);
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showToast("Erro ao salvar. Verifique o espaço do navegador.");
    console.error("Erro ao salvar tarefas:", error);
  }
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function render() {
  const filtered = getFilteredTasks();
  const statuses = ["pendente", "andamento", "concluida"];

  statuses.forEach(status => {
    const list = document.getElementById(`list-${status}`);
    const statusTasks = filtered.filter(task => task.status === status);
    document.getElementById(`count-${status}`).textContent = statusTasks.length;
    list.innerHTML = "";

    if (statusTasks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = hasActiveFilters() ? "Nenhuma tarefa encontrada." : "Nenhuma tarefa por aqui ainda.";
      list.appendChild(empty);
      return;
    }

    statusTasks.forEach(task => list.appendChild(createTaskCard(task)));
  });

  elements.total.textContent = tasks.length;
  elements.pending.textContent = tasks.filter(task => task.status === "pendente").length;
  elements.progress.textContent = tasks.filter(task => task.status === "andamento").length;
  elements.done.textContent = tasks.filter(task => task.status === "concluida").length;
}

function getFilteredTasks() {
  const search = elements.search.value.trim().toLocaleLowerCase("pt-BR");
  const priority = elements.priorityFilter.value;
  const status = elements.statusFilter.value;

  return tasks.filter(task => {
    const matchesTitle = task.title.toLocaleLowerCase("pt-BR").includes(search);
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesStatus = status === "all" || task.status === status;
    return matchesTitle && matchesPriority && matchesStatus;
  });
}

function hasActiveFilters() {
  return elements.search.value.trim() !== "" ||
    elements.priorityFilter.value !== "all" ||
    elements.statusFilter.value !== "all";
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const top = document.createElement("div");
  top.className = "task-card-top";

  const priority = document.createElement("span");
  priority.className = `priority ${task.priority}`;
  priority.textContent = `Prioridade ${task.priority === "media" ? "média" : task.priority}`;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editButton = makeIconButton("✎", "Editar tarefa", () => openEditDialog(task.id));
  const deleteButton = makeIconButton("×", "Excluir tarefa", () => deleteTask(task.id));
  actions.append(editButton, deleteButton);
  top.append(priority, actions);

  const title = document.createElement("h4");
  title.textContent = task.title;

  card.append(top, title);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description;
    card.appendChild(description);
  }

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const due = document.createElement("span");
  const overdue = task.due && task.due < getToday() && task.status !== "concluida";
  if (task.due) {
    due.textContent = `${overdue ? "⚠ Atrasada • " : "◷ "}${formatDate(task.due)}`;
  } else {
    due.textContent = "◷ Sem prazo";
  }
  if (overdue) meta.classList.add("overdue");

  const move = document.createElement("button");
  move.type = "button";
  move.className = "move-btn";
  if (task.status === "pendente") {
    move.textContent = "Iniciar →";
    move.addEventListener("click", () => changeStatus(task.id, "andamento"));
  } else if (task.status === "andamento") {
    move.textContent = "Concluir ✓";
    move.addEventListener("click", () => changeStatus(task.id, "concluida"));
  } else {
    move.textContent = "Reabrir ↶";
    move.addEventListener("click", () => changeStatus(task.id, "pendente"));
  }
  meta.append(due, move);
  card.appendChild(meta);
  return card;
}

function makeIconButton(symbol, label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-btn";
  button.textContent = symbol;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.addEventListener("click", action);
  return button;
}

function openNewDialog(initialStatus = "pendente") {
  editingId = null;
  elements.form.reset();
  elements.dialogTitle.textContent = "Nova tarefa";
  elements.status.value = initialStatus;
  elements.error.textContent = "";
  document.getElementById("save-task").textContent = "Salvar tarefa";
  elements.dialog.showModal();
  elements.title.focus();
}

function openEditDialog(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  editingId = id;
  elements.dialogTitle.textContent = "Editar tarefa";
  elements.title.value = task.title;
  elements.description.value = task.description || "";
  elements.priority.value = task.priority;
  elements.due.value = task.due || "";
  elements.status.value = task.status;
  elements.error.textContent = "";
  document.getElementById("save-task").textContent = "Salvar alterações";
  elements.dialog.showModal();
  elements.title.focus();
}

function saveTask(event) {
  event.preventDefault();
  const title = elements.title.value.trim();
  if (!title) {
    elements.error.textContent = "Informe um título para a tarefa.";
    elements.title.focus();
    return;
  }

  const taskData = {
    title,
    description: elements.description.value.trim(),
    priority: elements.priority.value,
    due: elements.due.value,
    status: elements.status.value
  };

  if (editingId) {
    const index = tasks.findIndex(task => task.id === editingId);
    if (index !== -1) tasks[index] = { ...tasks[index], ...taskData };
    showToast("Tarefa atualizada com sucesso.");
  } else {
    tasks.push({ id: createId(), ...taskData, createdAt: new Date().toISOString() });
    showToast("Tarefa criada com sucesso.");
  }

  saveTasks();
  render();
  elements.dialog.close();
  editingId = null;
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  const confirmed = window.confirm(`Deseja realmente excluir a tarefa "${task.title}"?`);
  if (!confirmed) return;
  tasks = tasks.filter(item => item.id !== id);
  saveTasks();
  render();
  showToast("Tarefa excluída.");
}

function changeStatus(id, newStatus) {
  const task = tasks.find(item => item.id === id);
  if (!task || !statusNames[newStatus]) return;
  task.status = newStatus;
  saveTasks();
  render();
  showToast(`Tarefa movida para ${statusNames[newStatus]}.`);
}

function formatDate(dateString) {
  const parts = dateString.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function clearFilters() {
  elements.search.value = "";
  elements.priorityFilter.value = "all";
  elements.statusFilter.value = "all";
  render();
}

document.getElementById("new-task-top").addEventListener("click", () => openNewDialog());
document.querySelectorAll("[data-add]").forEach(button => {
  button.addEventListener("click", () => openNewDialog(button.dataset.add));
});
document.getElementById("close-dialog").addEventListener("click", () => elements.dialog.close());
document.getElementById("cancel-dialog").addEventListener("click", () => elements.dialog.close());
elements.form.addEventListener("submit", saveTask);
elements.search.addEventListener("input", render);
elements.priorityFilter.addEventListener("change", render);
elements.statusFilter.addEventListener("change", render);
document.getElementById("clear-filters").addEventListener("click", clearFilters);

const today = new Date();
document.getElementById("today-label").textContent = today.toLocaleDateString("pt-BR", {
  weekday: "long", day: "numeric", month: "long"
}).toUpperCase();

loadTasks();
render();
