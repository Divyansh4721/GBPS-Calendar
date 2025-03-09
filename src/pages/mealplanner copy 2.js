import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Plus, Calendar, Edit3, Clock, Save, CheckCircle, Upload, Youtube, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { debounce } from 'lodash';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCO-Eo1BgF8AZDpeR3hF-S6qSt5DJcTtdg",
  authDomain: "gbpscalendar.firebaseapp.com",
  projectId: "gbpscalendar",
  storageBucket: "gbpscalendar.firebasestorage.app",
  messagingSenderId: "615502714228",
  appId: "1:615502714228:web:a6bb2c10699900cefa4821"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const mealPlanDocRef = doc(db, "MealPlan", "currentPlan");

// Meal time slots - defined once outside component
const DEFAULT_MEAL_SLOTS = [
  'Before Breakfast (8:30 AM)',
  'Breakfast (9:30 AM)',
  'Lunch (12 PM)',
  'Katha ke beech (5 PM)',
  'Dinner (7:15 PM)',
];

// Predefined categories for recipes - defined once outside component
const PREDEFINED_CATEGORIES = ['Chatni', 'Daal', 'Fruits', 'Roti', 'Sabji', 'Salad', 'Soup'];

const DietPlannerApp = () => {
  const navigate = useNavigate();
  
  // Core state
  const [recipes, setRecipes] = useState([]);
  const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [customTabs, setCustomTabs] = useState(['Ekadashi']);
  const [mealPlan, setMealPlan] = useState({});
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState('categories');
  const [selectedMealSlot, setSelectedMealSlot] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openCategory, setOpenCategory] = useState("");
  const [editRecipeId, setEditRecipeId] = useState(null);
  const [editedRecipe, setEditedRecipe] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // New state for save status feedback

  // Calculate the current day based on activeDayIndex
  const currentDay = useMemo(() => 
    [...days, ...customTabs][activeDayIndex], 
    [days, customTabs, activeDayIndex]
  );

  // Get unique categories from both recipes and predefined list
  const categories = useMemo(() => 
    [...new Set([...recipes.map(recipe => recipe.category), ...PREDEFINED_CATEGORIES])].sort(),
    [recipes]
  );

  // Initialize Firebase data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Check if document exists
        const docSnap = await getDoc(mealPlanDocRef);
        
        if (!docSnap.exists()) {
          // Initialize with default data
          await initializeMealPlanInFirebase();
        }
        
        // Set up a realtime listener
        const unsubscribe = onSnapshot(mealPlanDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Update state with data from Firebase
            if (data.recipes) setRecipes(data.recipes);
            if (data.days) setDays(data.days);
            if (data.customTabs) setCustomTabs(data.customTabs);
            if (data.mealPlan) setMealPlan(data.mealPlan);
            
            setDataInitialized(true);
            setIsLoading(false);
          }
        }, 
        (error) => {
          console.error("Error in Firebase listener:", error);
          setIsLoading(false);
        });
        
        // Clean up listener
        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading data from Firebase:", error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Initialize meal plan in Firebase
  const initializeMealPlanInFirebase = async () => {
    try {
      const initialMealPlan = {};
      
      // Create empty structure for each day
      [...days, ...customTabs].forEach(day => {
        initialMealPlan[day] = {};
        DEFAULT_MEAL_SLOTS.forEach(slot => {
          initialMealPlan[day][slot] = [];
        });
      });
      
      await setDoc(mealPlanDocRef, {
        recipes: [],
        days: days,
        customTabs: customTabs,
        mealPlan: initialMealPlan,
        predefinedCategories: PREDEFINED_CATEGORIES,
        lastUpdated: serverTimestamp()
      });
      
      setMealPlan(initialMealPlan);
    } catch (error) {
      console.error("Error initializing data in Firebase:", error);
    }
  };

  // Optimized save function using transactions
  const saveDataToFirebase = async (dataToSave) => {
    try {
      setIsSaving(true);
      setSaveStatus("Saving...");
      
      // Use a transaction for atomic updates
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(mealPlanDocRef);
        
        if (!docSnap.exists()) {
          // If document doesn't exist, create it
          transaction.set(mealPlanDocRef, {
            ...dataToSave,
            lastUpdated: serverTimestamp()
          });
        } else {
          // Update only provided fields
          transaction.update(mealPlanDocRef, {
            ...dataToSave,
            lastUpdated: serverTimestamp()
          });
        }
      });
      
      setSaveStatus("Saved successfully!");
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      setSaveStatus("Save failed. Try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save for batch updates
  const debouncedSave = useCallback(
    debounce((data) => saveDataToFirebase(data), 500),
    []
  );

  // Event handlers
  const handleAddMeal = (slot) => {
    setSelectedMealSlot(slot);
    setModalView('categories');
    setShowModal(true);
  };

  const handleAddRecipeToMealPlan = async (recipe) => {
    if (!selectedMealSlot) return;
    
    // Create a deep copy of the meal plan
    const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));
    
    // Ensure the day and slot exists
    if (!updatedMealPlan[currentDay]) {
      updatedMealPlan[currentDay] = {};
    }
    
    if (!updatedMealPlan[currentDay][selectedMealSlot]) {
      updatedMealPlan[currentDay][selectedMealSlot] = [];
    }
    
    // Add the recipe
    updatedMealPlan[currentDay][selectedMealSlot].push(recipe);
    
    // Update local state
    setMealPlan(updatedMealPlan);
    setSelectedRecipe(null);
    setShowModal(false);
    
    // Save to Firebase
    await saveDataToFirebase({ mealPlan: updatedMealPlan });
  };

  const handleRemoveMeal = async (slot, index) => {
    // Create a deep copy of the meal plan
    const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));
    
    if (updatedMealPlan[currentDay] && updatedMealPlan[currentDay][slot]) {
      // Remove the meal at the specified index
      updatedMealPlan[currentDay][slot].splice(index, 1);
      
      // Update local state
      setMealPlan(updatedMealPlan);
      
      // Save to Firebase
      await saveDataToFirebase({ mealPlan: updatedMealPlan });
    }
  };

  const handleAddNewRecipe = async () => {
    // Create a new recipe
    const newRecipe = {
      id: `recipe_${Date.now()}`, // More semantic ID
      name: "New Recipe",
      category: PREDEFINED_CATEGORIES[0],
      ingredients: [],
      recipe: "",
      createdAt: new Date().toISOString()
    };
    
    // Add to recipes list
    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    
    // Set up for editing
    setSelectedRecipe(newRecipe);
    setEditRecipeId(newRecipe.id);
    setEditedRecipe(newRecipe);
    setModalView('details');
    
    // Save to Firebase
    await saveDataToFirebase({ recipes: updatedRecipes });
  };

  const handleCategoryRecipeAdd = async (category) => {
    // Create a new recipe in the specific category
    const newRecipe = {
      id: `recipe_${Date.now()}_${category.toLowerCase().replace(/\s/g, '_')}`,
      name: `New ${category} Recipe`,
      category: category,
      ingredients: [],
      recipe: "",
      createdAt: new Date().toISOString()
    };
    
    // Add to recipes list
    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    
    // Set up for editing
    setSelectedRecipe(newRecipe);
    setEditRecipeId(newRecipe.id);
    setEditedRecipe(newRecipe);
    setModalView('details');
    
    // Save to Firebase
    await saveDataToFirebase({ recipes: updatedRecipes });
  };

  const addCustomTab = async () => {
    const tabName = prompt("Enter name for new special category day:");
    
    if (tabName && tabName.trim() !== "") {
      const newTabName = tabName.trim();
      const newTabs = [...customTabs, newTabName];
      
      // Update custom tabs
      setCustomTabs(newTabs);
      
      // Add the new day to meal plan structure
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan[newTabName] = {};
      
      DEFAULT_MEAL_SLOTS.forEach(slot => {
        updatedMealPlan[newTabName][slot] = [];
      });
      
      // Update meal plan
      setMealPlan(updatedMealPlan);
      
      // Save to Firebase
      await saveDataToFirebase({ 
        customTabs: newTabs,
        mealPlan: updatedMealPlan
      });
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditRecipeId(recipe.id);
    setEditedRecipe({ ...recipe });
  };

  const handleSaveEdit = async () => {
    if (!editedRecipe) return;
    
    // Add last updated timestamp
    editedRecipe.lastUpdated = new Date().toISOString();
    
    // Update recipes
    const updatedRecipes = recipes.map(recipe =>
      recipe.id === editedRecipe.id ? editedRecipe : recipe
    );
    
    setRecipes(updatedRecipes);
    
    // Update selected recipe if it's being edited
    if (selectedRecipe && selectedRecipe.id === editedRecipe.id) {
      setSelectedRecipe(editedRecipe);
    }
    
    // Reset edit state
    setEditRecipeId(null);
    
    // Create a deep copy of the meal plan
    const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));
    let mealPlanUpdated = false;
    
    // Update any instances of this recipe in the meal plan
    Object.keys(updatedMealPlan).forEach(day => {
      Object.keys(updatedMealPlan[day]).forEach(slot => {
        updatedMealPlan[day][slot] = updatedMealPlan[day][slot].map(mealItem => {
          if (mealItem.id === editedRecipe.id) {
            mealPlanUpdated = true;
            return editedRecipe;
          }
          return mealItem;
        });
      });
    });
    
    // Update meal plan if needed
    if (mealPlanUpdated) {
      setMealPlan(updatedMealPlan);
    }
    
    // Save updates to Firebase
    await saveDataToFirebase({
      recipes: updatedRecipes,
      ...(mealPlanUpdated && { mealPlan: updatedMealPlan })
    });
  };

  const handleCancelEdit = () => {
    // If this is a new recipe that was being edited, remove it
    if (selectedRecipe && editRecipeId) {
      const isNewRecipe = selectedRecipe.name === "New Recipe" ||
        selectedRecipe.name.startsWith("New ");
      
      if (isNewRecipe) {
        // Remove from recipes
        const updatedRecipes = recipes.filter(r => r.id !== selectedRecipe.id);
        setRecipes(updatedRecipes);
        
        // Save to Firebase
        debouncedSave({ recipes: updatedRecipes });
      }
    }
    
    // Reset edit state
    setEditRecipeId(null);
    setEditedRecipe(null);
    
    // Go back to categories if it was a new recipe
    if (selectedRecipe && (selectedRecipe.name === "New Recipe" ||
      selectedRecipe.name.startsWith("New "))) {
      setModalView('categories');
      setSelectedRecipe(null);
    }
  };

  const handleDeleteRecipe = (recipeId) => {
    setRecipeToDelete(recipeId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteRecipe = async () => {
    if (!recipeToDelete) return;
    
    // Remove from recipes
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeToDelete);
    setRecipes(updatedRecipes);
    
    // Close details view if we're deleting the selected recipe
    if (selectedRecipe && selectedRecipe.id === recipeToDelete) {
      setModalView('categories');
      setSelectedRecipe(null);
    }
    
    // Create a deep copy of the meal plan
    const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));
    let mealPlanUpdated = false;
    
    // Remove any instances of this recipe from the meal plan
    Object.keys(updatedMealPlan).forEach(day => {
      Object.keys(updatedMealPlan[day]).forEach(slot => {
        const originalLength = updatedMealPlan[day][slot].length;
        updatedMealPlan[day][slot] = updatedMealPlan[day][slot].filter(mealItem => 
          mealItem.id !== recipeToDelete
        );
        
        if (originalLength !== updatedMealPlan[day][slot].length) {
          mealPlanUpdated = true;
        }
      });
    });
    
    // Update meal plan if needed
    if (mealPlanUpdated) {
      setMealPlan(updatedMealPlan);
    }
    
    // Save to Firebase
    await saveDataToFirebase({
      recipes: updatedRecipes,
      ...(mealPlanUpdated && { mealPlan: updatedMealPlan })
    });
    
    // Reset confirmation dialog
    setShowConfirmDialog(false);
    setRecipeToDelete(null);
  };

  // Recipe editing helpers
  const handleInputChange = (field, value) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients[index] = value;
    
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: updatedIngredients
    }));
  };

  const addIngredient = () => {
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ""]
    }));
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: updatedIngredients
    }));
  };

  const toggleCategory = (category) => {
    setOpenCategory(prev => prev === category ? "" : category);
  };

  const truncateText = (text, length = 30) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // Loading screen
  if (isLoading && !dataInitialized) {
    return (
      <div className="flex justify-center items-center h-screen bg-purple-50">
        <div className="text-center">
          <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
          <div className="text-purple-600 text-xl mb-4">Loading your meal plan...</div>
          <div className="h-2 w-48 bg-purple-300 rounded mx-auto relative overflow-hidden">
            <div className="absolute h-full bg-purple-600 animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg relative">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex space-x-2 z-20">
          <button
            onClick={() => navigate("/youtube")}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1 sm:p-1 rounded-full transition-all duration-300 shadow-lg"
            title="YouTube Channel"
            aria-label="YouTube Channel"
          >
            <Youtube size={20} color="white" />
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1 sm:p-1 rounded-full transition-all duration-300 shadow-lg"
            title="Upload Calendar"
            aria-label="Upload Calendar"
          >
            <Upload size={20} color="white" />
          </button>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="relative">
                <img
                  className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 relative z-10 p-1 rounded-full cursor-pointer"
                  src="/assets/images/logo.png"
                  alt="GBPS Trust Logo"
                  onClick={() => navigate("/")}
                />
              </div>
              <div className="text-center md:text-left mt-2 md:mt-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md mb-0">
                  Guri Ji's Health Protective Diet Chart
                </h1>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-purple-700/70 to-pink-700/70 backdrop-blur-sm px-6 py-3 rounded-xl text-center">
                <p className="text-white text-lg font-medium">
                  Serving the Vaishnava Community
                </p>
                <div className="mt-1 h-0.5 w-24 mx-auto bg-gradient-to-r from-yellow-200 to-yellow-400"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
      </header>

      {/* Day Tabs */}
      <div className="flex overflow-x-auto bg-white shadow py-2 px-4 border-b border-purple-100 sticky top-0 z-10">
        {days.map((day, index) => (
          <button
            key={day}
            className={`px-4 py-2 mx-1 rounded-lg whitespace-nowrap transition-all duration-300 ${
              activeDayIndex === index
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
            onClick={() => setActiveDayIndex(index)}
          >
            {day}
          </button>
        ))}
        {customTabs.map((tab, index) => (
          <button
            key={tab}
            className={`px-4 py-2 mx-1 rounded-lg whitespace-nowrap transition-all duration-300 ${
              activeDayIndex === days.length + index
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
            onClick={() => setActiveDayIndex(days.length + index)}
          >
            {tab}
          </button>
        ))}
        <button
          className="px-4 py-2 mx-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center hover:from-orange-600 hover:to-pink-600 shadow-md transition-all duration-300"
          onClick={addCustomTab}
        >
          <Plus size={16} className="mr-1" /> Add Special Day
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto p-4">
        {/* Save status indicator */}
        {saveStatus && (
          <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-500 ${
            saveStatus.includes("failed") 
              ? "bg-red-500 text-white" 
              : saveStatus.includes("Saved") 
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
          }`}>
            <div className="flex items-center">
              {saveStatus.includes("Saving") && (
                <Loader size={18} className="animate-spin mr-2" />
              )}
              {saveStatus.includes("Saved") && (
                <CheckCircle size={18} className="mr-2" />
              )}
              {saveStatus.includes("failed") && (
                <X size={18} className="mr-2" />
              )}
              <span>{saveStatus}</span>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4 flex items-center text-purple-800">
          <Calendar className="mr-2 text-pink-500" /> {currentDay} Meal Plan
          <div className="ml-2 h-0.5 w-16 bg-gradient-to-r from-yellow-300 to-amber-400"></div>
        </h2>

        {/* Meal slots grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_MEAL_SLOTS.map((slot) => {
            const mealsInSlot = mealPlan[currentDay]?.[slot] || [];
            return (
              <div key={slot} className="bg-white rounded-lg shadow-md p-4 border-t-2 border-purple-300 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold flex items-center text-purple-700">
                    <Clock size={16} className="mr-2 text-pink-500" />
                    {slot}
                  </h3>
                  <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:from-purple-600 hover:to-pink-600 shadow-md transition-all duration-300"
                    onClick={() => handleAddMeal(slot)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {mealsInSlot.length > 0 ? (
                  <div className="space-y-3">
                    {mealsInSlot.map((meal, index) => (
                      <div key={index} className="bg-purple-50 p-3 rounded-md flex justify-between items-start border-l-2 border-pink-300 hover:bg-purple-100 transition-colors duration-200">
                        <div>
                          <p className="font-medium text-purple-800">{meal.name}</p>
                          <p className="text-sm text-pink-600">{meal.category}</p>
                        </div>
                        <button
                          className="text-pink-500 hover:text-pink-700 p-1 rounded-full hover:bg-pink-100 transition-colors duration-200"
                          onClick={() => handleRemoveMeal(slot, index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-md border border-dashed border-purple-200">
                    <p className="text-purple-400 text-center mb-2">No meals added yet</p>
                    <button
                      className="text-purple-500 hover:text-purple-700 text-sm flex items-center"
                      onClick={() => handleAddMeal(slot)}
                    >
                      <Plus size={14} className="mr-1" /> Add a meal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipe Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-semibold">
                {modalView === 'categories' 
                  ? `Add Meal to ${selectedMealSlot}` 
                  : selectedRecipe ? selectedRecipe.name : 'Recipe Details'}
              </h2>
              <button
                className="text-white hover:text-yellow-200 transition-colors rounded-full hover:bg-white/10 p-1"
                onClick={() => {
                  setShowModal(false);
                  setSelectedRecipe(null);
                  setModalView('categories');
                  setEditRecipeId(null);
                  setEditedRecipe(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
            
            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto p-4">
              {/* Categories View */}
              {modalView === 'categories' && (
                <div className="w-full">
                  {/* Add New Recipe Button */}
                  <div className="mb-6">
                    <button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-lg font-semibold flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-md"
                      onClick={handleAddNewRecipe}
                    >
                      <Plus size={20} className="mr-2" /> Create New Recipe
                    </button>
                  </div>

                  {/* Category Accordions */}
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const isCategoryOpen = openCategory === category;
                      const recipesInCategory = recipes.filter(recipe => recipe.category === category);
                      const hasRecipes = recipesInCategory.length > 0;
                      
                      return (
                        <div key={category} className="border rounded-md overflow-hidden border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                          <button
                            className="w-full font-semibold bg-purple-50 p-3 text-left flex justify-between items-center text-purple-700"
                            onClick={() => toggleCategory(category)}
                          >
                            <span>{category}</span>
                            <div className="flex items-center">
                              <button
                                className="mr-2 bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryRecipeAdd(category);
                                }}
                                title={`Add new ${category} recipe`}
                              >
                                <Plus size={16} />
                              </button>
                              <span className="text-lg text-purple-500">{isCategoryOpen ? '−' : '+'}</span>
                            </div>
                          </button>
                          
                          {/* Category Content - Only rendered when open */}
                          {isCategoryOpen && (
                            <div className="p-2 space-y-2 bg-white">
                              {hasRecipes ? (
                                recipesInCategory.map(recipe => (
                                  <div
                                    key={recipe.id}
                                    className="p-3 border-b border-purple-100 cursor-pointer hover:bg-purple-50 rounded-md flex justify-between items-center transition-colors duration-200"
                                    onClick={() => {
                                      setSelectedRecipe(recipe);
                                      setModalView('details');
                                    }}
                                  >
                                    <div>
                                      <p className="font-medium text-purple-800">{recipe.name}</p>
                                      <p className="text-sm text-purple-500 mt-1">{truncateText(recipe.recipe)}</p>
                                    </div>
                                    <button
                                      className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1 rounded-md text-sm hover:from-pink-600 hover:to-orange-600 transition-all duration-300 shadow-sm flex items-center"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddRecipeToMealPlan(recipe);
                                      }}
                                    >
                                      <Plus size={14} className="mr-1" /> Add
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 bg-purple-50 rounded-md">
                                  <p className="text-purple-400">No recipes in this category</p>
                                  <button
                                    className="mt-2 text-purple-600 text-sm hover:text-purple-800 flex items-center mx-auto"
                                    onClick={() => handleCategoryRecipeAdd(category)}
                                  >
                                    <Plus size={14} className="mr-1" /> Add one now
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Recipe Details View */}
              {modalView === 'details' && selectedRecipe && (
                <div className="w-full">
                  <button
                    className="mb-4 flex items-center text-purple-600 hover:text-purple-800"
                    onClick={() => {
                      // Clean up any edits if going back to categories
                      if (editRecipeId) {
                        handleCancelEdit();
                      }
                      setModalView('categories');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Categories
                  </button>
                  
                  <div className="bg-white p-6 rounded-lg shadow-md border border-purple-200">
                    {/* Recipe Header - Edit Mode or View Mode */}
                    {editRecipeId === selectedRecipe.id ? (
                      <>
                        <input
                          type="text"
                          className="text-xl font-semibold mb-2 text-purple-700 p-2 border border-purple-300 rounded w-full focus:border-purple-500 focus:ring focus:ring-purple-200 outline-none transition-all duration-200"
                          value={editedRecipe.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Recipe Name"
                        />
                        <select
                          className="text-sm text-pink-500 mb-4 p-2 border border-purple-300 rounded w-full focus:border-purple-500 focus:ring focus:ring-purple-200 outline-none transition-all duration-200"
                          value={editedRecipe.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                        >
                          {PREDEFINED_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold mb-2 text-purple-700">{selectedRecipe.name}</h3>
                        <p className="text-sm text-pink-500 mb-4 flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
                          Category: {selectedRecipe.category}
                        </p>
                      </>
                    )}
                    
                    <div className="h-0.5 w-32 bg-gradient-to-r from-yellow-300 to-amber-400 mb-4"></div>
                    
                    {/* Ingredients Section */}
                    <div className="mb-6">
                      <h4 className="font-medium text-purple-700 mb-2 border-b pb-1 border-purple-200 flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Ingredients:
                      </h4>
                      
                      {editRecipeId === selectedRecipe.id ? (
                        <div className="space-y-2 mt-3">
                          {editedRecipe.ingredients.map((ingredient, idx) => (
                            <div key={idx} className="flex items-center">
                              <input
                                type="text"
                                className="flex-grow p-2 border border-purple-300 rounded focus:ring focus:ring-purple-200 outline-none transition-all duration-200"
                                value={ingredient}
                                onChange={(e) => handleIngredientChange(idx, e.target.value)}
                                placeholder={`Ingredient ${idx + 1}`}
                              />
                              <button
                                className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                                onClick={() => removeIngredient(idx)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            className="mt-2 bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-all duration-300 flex items-center"
                            onClick={addIngredient}
                          >
                            <Plus size={14} className="inline mr-1" /> Add Ingredient
                          </button>
                        </div>
                      ) : (
                        <>
                          {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                            <ul className="list-disc ml-5 space-y-1 mt-3">
                              {selectedRecipe.ingredients.map((ingredient, idx) => (
                                <li key={idx} className="text-purple-600">{ingredient}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-purple-400 italic mt-3">No ingredients listed</p>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Recipe Instructions Section */}
                    <div className="mb-6">
                      <h4 className="font-medium text-purple-700 mb-2 border-b pb-1 border-purple-200 flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        Recipe Instructions:
                      </h4>
                      
                      {editRecipeId === selectedRecipe.id ? (
                        <textarea
                          className="w-full h-40 p-2 border border-purple-300 rounded text-purple-600 mt-3 focus:ring focus:ring-purple-200 outline-none transition-all duration-200"
                          value={editedRecipe.recipe || ""}
                          onChange={(e) => handleInputChange('recipe', e.target.value)}
                          placeholder="Enter recipe instructions here..."
                        />
                      ) : (
                        <div className="mt-3 bg-purple-50 p-4 rounded-md">
                          {selectedRecipe.recipe ? (
                            <p className="text-purple-600 whitespace-pre-line">{selectedRecipe.recipe}</p>
                          ) : (
                            <p className="text-purple-400 italic">No recipe instructions available</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      {editRecipeId === selectedRecipe.id ? (
                        <>
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center shadow-md transition-all duration-300"
                            onClick={handleSaveEdit}
                          >
                            <CheckCircle size={16} className="mr-1" /> Save Changes
                          </button>
                          <button
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center shadow-md transition-all duration-300"
                            onClick={handleCancelEdit}
                          >
                            <X size={16} className="mr-1" /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-pink-600 flex items-center shadow-md transition-all duration-300"
                            onClick={() => handleAddRecipeToMealPlan(selectedRecipe)}
                          >
                            <Plus size={16} className="mr-1" /> Add to Meal Plan
                          </button>
                          <button
                            className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-md hover:from-pink-600 hover:to-orange-600 flex items-center shadow-md transition-all duration-300"
                            onClick={() => handleEditRecipe(selectedRecipe)}
                          >
                            <Edit3 size={16} className="mr-1" /> Edit
                          </button>
                          <button
                            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-red-800 flex items-center shadow-md transition-all duration-300"
                            onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                          >
                            <X size={16} className="mr-1" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
              <button
                className="text-white hover:text-yellow-200 transition-colors"
                onClick={() => setShowConfirmDialog(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">Are you sure you want to delete this recipe? This action cannot be undone and will remove it from all meal plans.</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  onClick={confirmDeleteRecipe}
                >
                  <X size={16} className="mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Global Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
            <Loader size={24} className="animate-spin text-purple-600 mr-3" />
            <span className="text-purple-600 text-xl">Saving changes...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlannerApp;