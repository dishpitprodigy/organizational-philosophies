// Pure form-definition selection, condition, and compilation logic.
// This file is shared by the standalone browser prototype and Node tests.

(function exposeFormDefinitions(root) {
  const CONDITION_OPERATORS = new Set([
    "all",
    "any",
    "not",
    "equals",
    "includes",
    "present",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
  ]);

  function selectFormDefinition(definitions, context) {
    return definitions.find((definition) =>
      (definition.intakeContexts || []).every(
        (entry) => context[entry.field] === entry.equals
      )
    );
  }

  function answerValue(operand, answers) {
    if (
      typeof operand === "string" &&
      Object.prototype.hasOwnProperty.call(answers, operand)
    ) {
      return answers[operand];
    }
    return operand;
  }

  function compare(condition, answers, comparator) {
    const [left, right] = condition.map((operand) =>
      answerValue(operand, answers)
    );
    return comparator(left, right);
  }

  function evaluateCondition(condition, answers) {
    if (!condition) return true;
    const operators = Object.keys(condition);
    if (operators.length !== 1 || !CONDITION_OPERATORS.has(operators[0])) {
      throw new Error(
        `Unsupported condition operator: ${operators.join(", ") || "missing"}`
      );
    }

    const operator = operators[0];
    const value = condition[operator];
    if (operator === "all") {
      return value.every((entry) => evaluateCondition(entry, answers));
    }
    if (operator === "any") {
      return value.some((entry) => evaluateCondition(entry, answers));
    }
    if (operator === "not") return !evaluateCondition(value, answers);
    if (operator === "present") {
      const answer = answers[value];
      return answer !== undefined && answer !== null && answer !== "";
    }
    if (operator === "equals") {
      return compare(value, answers, (left, right) => left === right);
    }
    if (operator === "includes") {
      return compare(value, answers, (left, right) =>
        Array.isArray(left)
          ? left.includes(right)
          : String(left || "").includes(String(right || ""))
      );
    }
    if (operator === "greaterThan") {
      return compare(
        value,
        answers,
        (left, right) => Number(left) > Number(right)
      );
    }
    if (operator === "greaterThanOrEqual") {
      return compare(
        value,
        answers,
        (left, right) => Number(left) >= Number(right)
      );
    }
    if (operator === "lessThan") {
      return compare(
        value,
        answers,
        (left, right) => Number(left) < Number(right)
      );
    }
    return compare(
      value,
      answers,
      (left, right) => Number(left) <= Number(right)
    );
  }

  function fieldsIn(definition) {
    return (definition.sections || []).flatMap(
      (section) => section.fields || []
    );
  }

  function setPath(target, path, value) {
    const keys = path.split(".");
    const finalKey = keys.pop();
    const parent = keys.reduce((object, key) => {
      object[key] ??= {};
      return object[key];
    }, target);
    parent[finalKey] = structuredClone(value);
  }

  function getPath(source, path) {
    return path.split(".").reduce((value, key) => value?.[key], source);
  }

  function collectAnswers(definition, state) {
    const answers = {};
    for (const field of fieldsIn(definition)) {
      if (!field.statePath) continue;
      const value = getPath(state, field.statePath);
      if (value !== undefined) answers[field.id] = structuredClone(value);
    }
    return answers;
  }

  function compileAnswers(definition, answers) {
    const artifact = {};
    for (const field of fieldsIn(definition)) {
      if (!field.outputPath) continue;
      if (!Object.prototype.hasOwnProperty.call(answers, field.id)) continue;
      setPath(artifact, field.outputPath, answers[field.id]);
    }
    return artifact;
  }

  function answerIsMissing(field, value) {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) {
      return value.length < Number(field.minimumItems || 1);
    }
    return false;
  }

  function validateAnswers(definition, answers) {
    const missing = [];
    for (const field of fieldsIn(definition)) {
      const required =
        field.required === true ||
        (field.requiredWhen && evaluateCondition(field.requiredWhen, answers));
      if (required && answerIsMissing(field, answers[field.id])) {
        missing.push({ id: field.id, label: field.label });
        continue;
      }
      if (field.type === "repeater" && Array.isArray(answers[field.id])) {
        answers[field.id].forEach((row, index) => {
          for (const column of field.columns.filter(
            (entry) => entry.required
          )) {
            if (answerIsMissing(column, row?.[column.key])) {
              missing.push({
                id: `${field.id}[${index}].${column.key}`,
                label: `${field.label} row ${index + 1}: ${column.label}`,
              });
            }
          }
        });
      }
    }
    return missing;
  }

  function validateFormDefinition(definition) {
    if (!definition?.id || !Number.isInteger(definition.version)) {
      throw new Error(
        "A form definition requires a stable id and integer version."
      );
    }
    const identifiers = new Set();
    for (const field of fieldsIn(definition)) {
      if (!field.id || identifiers.has(field.id)) {
        throw new Error(
          `Duplicate form field identifier: ${field.id || "missing"}`
        );
      }
      identifiers.add(field.id);
      if (
        !field.label ||
        !field.type ||
        !field.statePath ||
        !field.outputPath
      ) {
        throw new Error(
          `Form field ${field.id} requires label, type, statePath, and outputPath.`
        );
      }
      if (field.requiredWhen) evaluateCondition(field.requiredWhen, {});
      if (field.type === "repeater") {
        if (
          !field.addLabel ||
          !Array.isArray(field.columns) ||
          !field.columns.length
        ) {
          throw new Error(
            `Repeater field ${field.id} requires an addLabel and columns.`
          );
        }
        for (const column of field.columns) {
          if (!column.key || !column.label) {
            throw new Error(
              `Repeater field ${field.id} has a column without a stable key and label.`
            );
          }
        }
      }
    }
    return definition;
  }

  const api = {
    collectAnswers,
    compileAnswers,
    evaluateCondition,
    fieldsIn,
    selectFormDefinition,
    validateAnswers,
    validateFormDefinition,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WorkIntakeFormDefinitions = api;
})(typeof window !== "undefined" ? window : globalThis);
