import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const TEMPLATE_URL = '/templates/user_import_template.xlsx';

export default function TemplateDownload() {
  return (
    <div className="flex items-center justify-center">
      <a
        href={TEMPLATE_URL}
        download="user_import_template.xlsx"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        Tải file mẫu Excel
      </a>
    </div>
  );
}
