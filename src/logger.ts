export interface Logger {
  info(...contents: any[]): void;
  warn(...contents: any[]): void;
  error(...contents: any[]): void;
  debug(...contents: any[]): void;
}

export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export class Logger implements Logger {
  private static loggers: Partial<Record<LogLevel, Logger>> = {};

  static fromLogLevelString(level: string): Logger {
    level = level.toUpperCase(); // normalize to keys

    const levelEnum = Object.keys(LogLevel).includes(level)
      ? LogLevel[level as keyof typeof LogLevel]
      : LogLevel.ERROR;

    return (this.loggers[levelEnum] ||= new Logger(levelEnum));
  }

  constructor(private readonly level: LogLevel) {}

  info(...contents: any[]): void {
    this.log(LogLevel.INFO, ...contents);
  }

  warn(...contents: any[]): void {
    this.log(LogLevel.WARN, ...contents);
  }

  error(...contents: any[]): void {
    this.log(LogLevel.ERROR, ...contents);
  }

  debug(...contents: any[]): void {
    this.log(LogLevel.DEBUG, ...contents);
  }

  private log(level: LogLevel, ...contents: any[]): void {
    if (level >= this.level) {
      console.log(`${LogLevel[level]}: ${contents.map(String).join(' ')}`);
    }
  }
}
