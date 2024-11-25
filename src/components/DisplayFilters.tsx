interface DisplayFiltersProps {
    showImages: boolean;
    showText: boolean;
    onToggleImages: (show: boolean) => void;
    onToggleText: (show: boolean) => void;
  }
  
  export default function DisplayFilters({
    showImages,
    showText,
    onToggleImages,
    onToggleText,
  }: DisplayFiltersProps) {
    return (
      <div className="absolute top-4 right-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showImages}
            onChange={(e) => onToggleImages(e.target.checked)}
            className="w-4 h-4"
          />
          Images
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showText}
            onChange={(e) => onToggleText(e.target.checked)}
            className="w-4 h-4"
          />
          Text
        </label>
      </div>
    );
  }