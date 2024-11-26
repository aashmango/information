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
      <div>
        <label>
          <input
            type="checkbox"
            checked={showImages}
            onChange={(e) => onToggleImages(e.target.checked)}
          />
          Images
        </label>
        <label>
          <input
            type="checkbox"
            checked={showText}
            onChange={(e) => onToggleText(e.target.checked)}
          />
          Text
        </label>
      </div>
    );
  }