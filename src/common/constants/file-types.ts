/**
 * Разрешенные расширения файлов для проектов
 *
 * Категории:
 * - Изображения: png, jpg, jpeg, gif, bmp, svg
 * - Документы: pdf, doc, docx, txt, rtf
 * - Таблицы/Расчеты: xls, xlsx, csv, ods
 * - Презентации: ppt, pptx
 * - Чертежи/CAD: dwg, dxf
 * - Архивы: zip, rar, 7z
 * - Другое: msg (письма Outlook)
 */
export const ALLOWED_PROJECT_FILE_EXTENSIONS = [
  // Изображения
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.svg',

  // Документы
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.rtf',

  // Таблицы/Расчеты
  '.xls',
  '.xlsx',
  '.csv',
  '.ods',

  // Презентации
  '.ppt',
  '.pptx',

  // Чертежи/CAD
  '.dwg',
  '.dxf',

  // Архивы
  '.zip',
  '.rar',
  '.7z',

  // Другое
  '.msg',
];

/**
 * MIME типы для валидации на бэкенде
 */
export const ALLOWED_PROJECT_MIME_TYPES = [
  // Изображения
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/bmp',
  'image/svg+xml',

  // PDF
  'application/pdf',

  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.oasis.opendocument.spreadsheet',

  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Текстовые
  'text/plain',
  'text/rtf',
  'application/rtf',

  // Архивы
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',

  // CAD
  'application/acad',
  'application/x-acad',
  'application/autocad_dwg',
  'image/x-dwg',
  'image/vnd.dwg',
  'application/dxf',
  'image/vnd.dxf',

  // Outlook
  'application/vnd.ms-outlook',

  // Fallback для неопределенных типов
  'application/octet-stream',
];

/**
 * Проверка расширения файла
 */
export function isAllowedFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALLOWED_PROJECT_FILE_EXTENSIONS.includes(ext);
}

/**
 * Проверка MIME типа
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_PROJECT_MIME_TYPES.includes(mimeType.toLowerCase());
}
