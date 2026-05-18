import { Download } from "lucide-react";

type ExportControlsProps = {
  onExportJson: () => void;
  onExportCsv?: () => void;
  onExportTxt: () => void;
  csvDisabled?: boolean;
};

export function ExportControls({ onExportJson, onExportCsv, onExportTxt, csvDisabled = false }: ExportControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn-secondary" type="button" onClick={onExportJson}>
        <Download className="h-4 w-4" aria-hidden="true" />
        JSON
      </button>
      {onExportCsv ? (
        <button className="btn-secondary" type="button" onClick={onExportCsv} disabled={csvDisabled}>
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV
        </button>
      ) : null}
      <button className="btn-secondary" type="button" onClick={onExportTxt}>
        <Download className="h-4 w-4" aria-hidden="true" />
        TXT
      </button>
    </div>
  );
}

