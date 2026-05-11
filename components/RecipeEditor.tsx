

import React, { useState, useEffect, useRef } from 'react';
// FIX: Import `RecipeData` to resolve type errors.
import type { GeneratedPost, WordPressPost, RecipeData } from '../types';
import { Icons } from '../constants';
import { Spinner } from './Spinner';

interface RecipeEditorProps {
  post: GeneratedPost;
  targetPost: WordPressPost | null;
  onSave: (post: GeneratedPost, targetPost: WordPressPost | null, status: 'publish' | 'draft' | 'schedule', scheduledAt?: string | null) => void;
  onCancel: () => void;
  isSaving: boolean;
  onRegenerateImage: () => Promise<void>;
  isRegeneratingImage: boolean;
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; }> = ({ label, value, onChange, name }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input type="text" name={name} id={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
    </div>
);

const TextareaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; name: string; rows?: number }> = ({ label, value, onChange, name, rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <textarea name={name} id={name} value={value} onChange={onChange} rows={rows} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
    </div>
);

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ post, targetPost, onSave, onCancel, isSaving, onRegenerateImage, isRegeneratingImage }) => {
  const [editedPost, setEditedPost] = useState<GeneratedPost>(post);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      return tomorrow.toISOString().slice(0, 16); // format for datetime-local
  });

  const ingredientsRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the entire recipe_data structure and its nested arrays are always defined to prevent runtime errors.
    const incomingRecipeData = post.recipe_data || {};
    setEditedPost({
      ...post,
      recipe_data: {
        // Provide defaults for all properties, especially arrays and objects.
        name: '',
        description: '',
        prep_time: '',
        cook_time: '',
        total_time: '',
        yield: '',
        cuisine: '',
        category: '',
        notes: '',
        method: '',
        diet: '',
        video_url: '',
        image: undefined,
        image_alt: '',
        image_title: '',
        image_description: '',
        nutrition: {},
        aggregateRating: undefined,
        // Spread incoming data which might have missing or undefined properties.
        ...incomingRecipeData,
        // Explicitly ensure array properties are arrays, falling back to an empty array
        // if they were missing or undefined in the incoming data.
        // FIX: Cast incomingRecipeData to Partial<RecipeData> to safely access properties that may not exist if post.recipe_data is incomplete.
        keywords: (incomingRecipeData as Partial<RecipeData>).keywords || [],
        ingredients: (incomingRecipeData as Partial<RecipeData>).ingredients || [],
        instructions: (incomingRecipeData as Partial<RecipeData>).instructions || [],
      },
    });
  }, [post]);

  const handlePublishClick = () => {
      onSave(editedPost, targetPost, 'publish');
  };

  const handleDraftClick = () => {
      onSave(editedPost, targetPost, 'draft');
  };

  const handleScheduleConfirm = () => {
      onSave(editedPost, targetPost, 'schedule', new Date(scheduledAt).toISOString());
      setIsScheduling(false);
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedPost(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRecipeDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditedPost(prev => ({
      ...prev,
      recipe_data: {
        ...prev.recipe_data,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim());
    setEditedPost(prev => ({ ...prev, recipe_data: { ...prev.recipe_data, keywords }}));
  };
  
  const handleNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedPost(prev => ({
          ...prev,
          recipe_data: {
              ...prev.recipe_data,
              nutrition: {
                  ...prev.recipe_data.nutrition,
                  [e.target.name]: e.target.value
              }
          }
      }));
  };
  
  const handleListChange = (listName: 'ingredients' | 'instructions', index: number, value: string) => {
     setEditedPost(prev => {
        const newList = [...prev.recipe_data[listName]];
        newList[index] = value;
        return { ...prev, recipe_data: { ...prev.recipe_data, [listName]: newList } }
     });
  }

  const addListItem = (listName: 'ingredients' | 'instructions') => {
    const wasLength = editedPost.recipe_data[listName].length;
    setEditedPost(prev => ({ ...prev, recipe_data: { ...prev.recipe_data, [listName]: [...prev.recipe_data[listName], ''] } }));
    setTimeout(() => {
        const container = listName === 'ingredients' ? ingredientsRef.current : instructionsRef.current;
        if(container){
            const inputs = container.querySelectorAll('input, textarea');
            if(inputs.length > wasLength) (inputs[inputs.length - 1] as HTMLElement).focus();
        }
    }, 0);
  };

  const removeListItem = (listName: 'ingredients' | 'instructions', index: number) => {
     setEditedPost(prev => ({ ...prev, recipe_data: { ...prev.recipe_data, [listName]: prev.recipe_data[listName].filter((_, i) => i !== index) } }));
  };

  const handleReorder = (listName: 'ingredients' | 'instructions', index: number, direction: 'up' | 'down') => {
    setEditedPost(prev => {
        const list = [...prev.recipe_data[listName]];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= list.length) return prev;
        const [movedItem] = list.splice(index, 1);
        list.splice(newIndex, 0, movedItem);
        return { ...prev, recipe_data: { ...prev.recipe_data, [listName]: list } };
    });
  };

  const dietOptions = ['N/A', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Paleo', 'Keto'];

  return (
    <div className="bg-white p-4 sm:p-6 animate-fade-in">
      <div className="space-y-6">
        <div className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Featured Image</h3>
            <div className="flex flex-col items-center justify-center gap-4">
                {editedPost.recipe_data.image ? (
                    <img 
                        src={`data:image/jpeg;base64,${editedPost.recipe_data.image}`} 
                        alt={editedPost.recipe_data.image_alt || 'Generated recipe image'}
                        className="max-w-sm w-full h-auto rounded-lg shadow-md object-cover aspect-video"
                    />
                ) : (
                    <div className="max-w-sm w-full aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <p>No image available.</p>
                    </div>
                )}
                <button
                    type="button"
                    onClick={onRegenerateImage}
                    disabled={isRegeneratingImage}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isRegeneratingImage ? <><Spinner size="h-5 w-5" /><span>Generating...</span></> : <>{Icons.photo}<span>Regenerate Image</span></>}
                </button>
            </div>
        </div>

        <div className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold mb-2 text-teal-700">Blog Post Details</h3>
            <div className="space-y-4">
              <InputField label="Post Title" name="post_title" value={editedPost.post_title} onChange={handlePostChange} />
              <TextareaField label="Introduction" name="post_content" value={editedPost.post_content} onChange={handlePostChange} rows={6} />
            </div>
        </div>

        <div className="p-4 border rounded-md space-y-6">
            <h3 className="text-lg font-semibold text-teal-700">Recipe Card Details</h3>
            <div className="space-y-4">
                <InputField label="Recipe Name" name="name" value={editedPost.recipe_data.name} onChange={handleRecipeDataChange} />
                <TextareaField label="Recipe Description" name="description" value={editedPost.recipe_data.description} onChange={handleRecipeDataChange} rows={2} />
            </div>
            
            <div className="border-t pt-4">
                <h4 className="text-base font-semibold text-slate-800 mb-3">Details</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField label="Prep Time" name="prep_time" value={editedPost.recipe_data.prep_time} onChange={handleRecipeDataChange} />
                    <InputField label="Cook Time" name="cook_time" value={editedPost.recipe_data.cook_time} onChange={handleRecipeDataChange} />
                    <InputField label="Total Time" name="total_time" value={editedPost.recipe_data.total_time} onChange={handleRecipeDataChange} />
                    <InputField label="Yield" name="yield" value={editedPost.recipe_data.yield} onChange={handleRecipeDataChange} />
                    <InputField label="Category" name="category" value={editedPost.recipe_data.category} onChange={handleRecipeDataChange} />
                    <InputField label="Method" name="method" value={editedPost.recipe_data.method || ''} onChange={handleRecipeDataChange} />
                    <InputField label="Cuisine" name="cuisine" value={editedPost.recipe_data.cuisine} onChange={handleRecipeDataChange} />
                    <div>
                        <label htmlFor="diet" className="block text-sm font-medium text-slate-700">Diet</label>
                        <select name="diet" id="diet" value={editedPost.recipe_data.diet || 'N/A'} onChange={handleRecipeDataChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                            {dietOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4 space-y-4">
                <div>
                    <h4 className="text-base font-semibold text-slate-800 mb-2">Keywords</h4>
                    <InputField label="Keywords (comma-separated)" name="keywords" value={editedPost.recipe_data.keywords?.join(', ') || ''} onChange={handleKeywordsChange} />
                </div>
                <div>
                    <h4 className="text-base font-semibold text-slate-800 mb-2">Video URL</h4>
                    <InputField label="Video URL" name="video_url" value={editedPost.recipe_data.video_url || ''} onChange={handleRecipeDataChange} />
                </div>
            </div>
            
            <div className="border-t pt-4">
                <TextareaField label="Notes" name="notes" value={editedPost.recipe_data.notes || ''} onChange={handleRecipeDataChange} rows={3} />
            </div>

            <div className="border-t pt-4">
                <h4 className="text-base font-semibold text-slate-800 mb-3">Nutrition</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField label="Serving Size" name="servingSize" value={editedPost.recipe_data.nutrition?.servingSize || ''} onChange={handleNutritionChange} />
                    <InputField label="Calories" name="calories" value={editedPost.recipe_data.nutrition?.calories || ''} onChange={handleNutritionChange} />
                    <InputField label="Sugar" name="sugarContent" value={editedPost.recipe_data.nutrition?.sugarContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Sodium" name="sodiumContent" value={editedPost.recipe_data.nutrition?.sodiumContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Fat" name="fatContent" value={editedPost.recipe_data.nutrition?.fatContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Saturated Fat" name="saturatedFatContent" value={editedPost.recipe_data.nutrition?.saturatedFatContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Unsaturated Fat" name="unsaturatedFatContent" value={editedPost.recipe_data.nutrition?.unsaturatedFatContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Trans Fat" name="transFatContent" value={editedPost.recipe_data.nutrition?.transFatContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Carbohydrates" name="carbohydrateContent" value={editedPost.recipe_data.nutrition?.carbohydrateContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Fiber" name="fiberContent" value={editedPost.recipe_data.nutrition?.fiberContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Protein" name="proteinContent" value={editedPost.recipe_data.nutrition?.proteinContent || ''} onChange={handleNutritionChange} />
                    <InputField label="Cholesterol" name="cholesterolContent" value={editedPost.recipe_data.nutrition?.cholesterolContent || ''} onChange={handleNutritionChange} />
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div ref={ingredientsRef} className="p-4 border rounded-md space-y-2">
                <h3 className="text-lg font-semibold text-teal-700">Ingredients</h3>
                {editedPost.recipe_data.ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-2 items-center group">
                        <input type="text" value={ing} onChange={e => handleListChange('ingredients', index, e.target.value)} placeholder="e.g., 1 cup Flour" className="flex-grow mt-1 block px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm" />
                        <div className="flex flex-col">
                            <button onClick={() => handleReorder('ingredients', index, 'up')} disabled={index === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:hover:text-slate-300">{Icons.arrowUp}</button>
                            <button onClick={() => handleReorder('ingredients', index, 'down')} disabled={index === editedPost.recipe_data.ingredients.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:hover:text-slate-300">{Icons.arrowDown}</button>
                        </div>
                        <button onClick={() => removeListItem('ingredients', index)} className="p-1 text-slate-400 hover:text-red-500">{Icons.trash}</button>
                    </div>
                ))}
                <button onClick={() => addListItem('ingredients')} className="text-sm text-teal-600 font-semibold hover:text-teal-800">+ Add Ingredient</button>
            </div>
            <div ref={instructionsRef} className="p-4 border rounded-md space-y-2">
                <h3 className="text-lg font-semibold text-teal-700">Instructions</h3>
                {editedPost.recipe_data.instructions.map((inst, index) => (
                    <div key={index} className="flex gap-2 items-start">
                        <span className="pt-2 text-sm font-bold text-slate-500">{index + 1}.</span>
                        <textarea value={inst} onChange={e => handleListChange('instructions', index, e.target.value)} rows={2} className="flex-grow mt-1 block px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm" />
                        <div className="flex flex-col pt-1">
                            <button onClick={() => handleReorder('instructions', index, 'up')} disabled={index === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:hover:text-slate-300">{Icons.arrowUp}</button>
                            <button onClick={() => handleReorder('instructions', index, 'down')} disabled={index === editedPost.recipe_data.instructions.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:hover:text-slate-300">{Icons.arrowDown}</button>
                        </div>
                        <button onClick={() => removeListItem('instructions', index)} className="p-1 pt-2 text-slate-400 hover:text-red-500">{Icons.trash}</button>
                    </div>
                ))}
                <button onClick={() => addListItem('instructions')} className="text-sm text-teal-600 font-semibold hover:text-teal-800">+ Add Step</button>
            </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t bg-white sticky bottom-0 flex flex-col items-center gap-4 p-2 sm:p-4">
        {isScheduling && (
            <div className="w-full mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200 animate-fadeInUp">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-bold text-teal-800">Select Date and Time (Local)</label>
                        <input 
                            type="datetime-local" 
                            value={scheduledAt} 
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="mt-1 px-3 py-2 border border-teal-300 rounded focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleScheduleConfirm}
                            className="px-4 py-2 bg-teal-600 text-white rounded font-bold hover:bg-teal-700 transition"
                        >
                            Confirm Schedule
                        </button>
                        <button 
                            onClick={() => setIsScheduling(false)}
                            className="px-4 py-2 bg-white text-slate-600 border border-slate-300 rounded font-bold hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                <p className="mt-2 text-xs text-teal-700">The post will wait in the queue and publish automatically at the specified time.</p>
            </div>
        )}

        <div className="w-full flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
            <button onClick={onCancel} className="w-full sm:w-auto inline-flex justify-center px-6 py-2 border border-slate-300 rounded-md shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                Cancel
            </button>
            {!targetPost && (
                <>
                    <button
                        onClick={handleDraftClick}
                        disabled={isSaving || isScheduling}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Spinner size="h-5 w-5" /> : 'Save as Draft'}
                    </button>
                    <button
                        onClick={() => setIsScheduling(!isScheduling)}
                        disabled={isSaving}
                        className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-teal-600 rounded-md shadow-sm text-base font-medium transition-colors ${isScheduling ? 'bg-teal-100 text-teal-800' : 'text-teal-600 bg-white hover:bg-teal-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50`}
                    >
                        {Icons.clock} <span className="ml-2">Schedule</span>
                    </button>
                </>
            )}
            <button
                onClick={handlePublishClick}
                disabled={isSaving || isScheduling}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                {isSaving ? <Spinner size="h-5 w-5" /> : (targetPost ? 'Update Existing Post' : 'Publish to WordPress')}
            </button>
        </div>
      </div>
    </div>
  );
};