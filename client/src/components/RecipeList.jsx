import { FaTimes } from "react-icons/fa";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RecipeCard from "./RecipeCard";
import { useState, useRef, useEffect } from "react";

function SortableRecipeCard({ recipe, editMode, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recipe.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
    opacity: isDragging ? 0 : 1, // Hide original while dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`recipe-card-wrapper ${editMode ? "hover-always" : ""}`}
      {...(editMode ? listeners : {})}
      {...(editMode ? attributes : {})}
    >
      <div
        className={editMode ? "card-disabled-link" : ""}
        onClick={(e) => editMode && e.preventDefault()}
      >
        <RecipeCard
          id={recipe.id}
          title={recipe.title}
          author={recipe.authorName}
          imageUrl={recipe.imageUrl || recipe.image_url}
          cookingTime={recipe.cookingTime}
        />
      </div>
      {editMode && (
        <button
          className="remove-recipe-btn"
          onClick={() => onRemove(recipe.id)}
          title="Remove from favourites"
        >
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
}

export default function RecipeList({
  recipes = [],
  editMode = false,
  onRemove,
  onReorder,
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeId, setActiveId] = useState(null);
  const [activeRecipe, setActiveRecipe] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    const dragged = recipes.find((r) => r.id === event.active.id);
    setActiveRecipe(dragged);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveRecipe(null);

    if (!over || active.id === over.id) return;

    const oldIndex = recipes.findIndex((r) => r.id === active.id);
    const newIndex = recipes.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(recipes, oldIndex, newIndex);
    onReorder?.(reordered);
  };

  if (recipes.length === 0) {
    return <div className="recipe-empty">No recipes to display.</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={recipes.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="recipe-list">
          {recipes.map((recipe, i) => (
            <SortableRecipeCard
              key={`${recipe.id}-${i}`}
              recipe={recipe}
              editMode={editMode}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeRecipe ? (
          <div className="recipe-card-wrapper drag-overlay">
            <RecipeCard {...activeRecipe} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
