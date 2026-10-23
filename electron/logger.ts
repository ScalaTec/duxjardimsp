import { app } from 'electron';
import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs';
import path from 'node:path';

const MAX_BYTES = 2 * 1024 * 1024;
let file: string | null = null;

function target(): string {
  if (file !== null) return file;
  try {
    const dir = app.getPath('logs');
    mkdirSync(dir, { recursive: true });
    file = path.join(dir, 'totem.log');
    try {
      if (statSync(file).size > MAX_BYTES) renameSync(file, `${file}.1`);
    } catch {
      /* arquivo ainda nao existe */
    }
  } catch {
    file = '';
  }
  return file;
}

/** Registro tecnico (arquivo + console). Nunca lanca: log nao pode derrubar o totem. */
export function log(level: 'info' | 'warn' | 'error', message: string, extra?: unknown): void {
  const line = `${new Date().toISOString()} [${level}] ${message}${extra === undefined ? '' : ` ${safe(extra)}`}`;
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
  try {
    const f = target();
    if (f) appendFileSync(f, `${line}\n`);
  } catch {
    /* ignora */
  }
}

function safe(v: unknown): string {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v);
  } catch {
    return String(v);
  }
}
