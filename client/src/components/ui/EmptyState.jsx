import Button from "./Button";

export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="text-6xl opacity-60">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="text-text-muted text-sm mt-1 max-w-xs">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
