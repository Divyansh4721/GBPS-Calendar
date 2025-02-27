import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Edit3, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Upload, Youtube } from 'lucide-react';
import sampleDishes from "./meals.json"

const DietPlannerApp = () => {
  const [recipes, setRecipes] = useState([]);
  const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [customTabs, setCustomTabs] = useState(['Ekadashi']);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [mealPlan, setMealPlan] = useState({});
  const [modalView, setModalView] = useState('categories');
  const navigate = useNavigate();
  // Change from a boolean to a string to track which category is open
  const [openCategory, setOpenCategory] = useState("");

  useEffect(() => {
    const initialMealPlan = {};
    [...days, ...customTabs].forEach(day => {
      initialMealPlan[day] = {
        'Before Breakfast (8:30 AM)': [],
        'Breakfast (9:30 AM)': [],
        'Lunch (12 PM)': [],
        'Katha ke beech (5 PM)': [],
        'Dinner (7:15 PM)': [],
      };
    });
    setMealPlan(initialMealPlan);
    const loadRecipes = async () => {
      try {
        setRecipes(sampleDishes);
      } catch (error) {
        console.error("Error loading recipes:", error);
      }
    };
    loadRecipes();
  }, [days, customTabs]);

  const mealSlots = [
    'Before Breakfast (8:30 AM)',
    'Breakfast (9:30 AM)',
    'Lunch (12 PM)',
    'Katha ke beech (5 PM)',
    'Dinner (7:15 PM)',
  ];

  const categories = [...new Set(recipes.map(recipe => recipe.category))].sort();

  const handleAddMeal = (slot) => {
    setSelectedMealSlot(slot);
    setModalView('categories');
    setShowModal(true);
  };

  const handleAddRecipeToMealPlan = (recipe) => {
    if (!selectedMealSlot) return;
    const currentDay = [...days, ...customTabs][activeDayIndex];
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan[currentDay][selectedMealSlot].push(recipe);
    setMealPlan(updatedMealPlan);
    setSelectedRecipe(null);
    setShowModal(false);
  };

  const handleRemoveMeal = (slot, index) => {
    const currentDay = [...days, ...customTabs][activeDayIndex];
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan[currentDay][slot].splice(index, 1);
    setMealPlan(updatedMealPlan);
  };

  const addCustomTab = () => {
    const tabName = prompt("Enter name for new special category day:");
    if (tabName && tabName.trim() !== "") {
      const newTabs = [...customTabs, tabName.trim()];
      setCustomTabs(newTabs);
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan[tabName.trim()] = {};
      mealSlots.forEach(slot => {
        updatedMealPlan[tabName.trim()][slot] = [];
      });
      setMealPlan(updatedMealPlan);
    }
  };

  const truncateText = (text, length = 30) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // Toggle function for handling accordion
  const toggleCategory = (category) => {
    setOpenCategory(prevCategory => prevCategory === category ? "" : category);
  };

  return (
    <div className="flex flex-col h-screen bg-purple-50">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg relative">
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
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-3 md:py-4`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="relative">
                <img
                  className={`h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 relative z-10 p-1 rounded-full cursor-pointer`}
                  src="/GBPS-Calendar/logo.png"
                  alt="GBPS Trust Logo"
                  onClick={() => navigate("/")}
                />
              </div>
              <div className="text-center md:text-left mt-2 md:mt-0">
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md mb-0`}>
                  Guri Ji's Health Protective Diet Chart
                </h1>
              </div>
            </div>
            <div className={`hidden lg:block`}>
              <div className="bg-gradient-to-r from-purple-700/70 to-pink-700/70 backdrop-blur-sm px-6 py-3 rounded-xl text-center">
                <p className="text-white text-lg font-medium">
                  Serving the Vaishnava Community
                </p>
                <div className="mt-1 h-0.5 w-24 mx-auto bg-gradient-to-r from-yellow-200 to-yellow-400"></div>
              </div>
            </div>
          </div>
        </div>
        <div className={`h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400`}></div>
      </div>
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto bg-white shadow py-2 px-4 border-b border-purple-100">
        {days.map((day, index) => (
          <button
            key={day}
            className={`px-4 py-2 mx-1 rounded-lg whitespace-nowrap transition-all duration-300 ${activeDayIndex === index
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
            className={`px-4 py-2 mx-1 rounded-lg whitespace-nowrap transition-all duration-300 ${activeDayIndex === days.length + index
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
        <h2 className="text-xl font-semibold mb-4 flex items-center text-purple-800">
          <Calendar className="mr-2 text-pink-500" /> {[...days, ...customTabs][activeDayIndex]} Meal Plan
          <div className="ml-2 h-0.5 w-16 bg-gradient-to-r from-yellow-300 to-amber-400"></div>
        </h2>

        {/* Meal Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealSlots.map((slot) => {
            const currentDay = [...days, ...customTabs][activeDayIndex];
            const mealsInSlot = mealPlan[currentDay]?.[slot] || [];
            return (
              <div key={slot} className="bg-white rounded-lg shadow-md p-4 border-t-2 border-purple-300">
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
                      <div key={index} className="bg-purple-50 p-3 rounded-md flex justify-between items-start border-l-2 border-pink-300">
                        <div>
                          <p className="font-medium text-purple-800">{meal.name}</p>
                          <p className="text-sm text-pink-600">{meal.category}</p>
                        </div>
                        <button
                          className="text-pink-500 hover:text-pink-700"
                          onClick={() => handleRemoveMeal(slot, index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-purple-300 text-center py-4">No meals added</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-semibold">
                Add Meal to {selectedMealSlot}
              </h2>
              <button
                className="text-white hover:text-yellow-200 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setSelectedRecipe(null);
                  setModalView('categories');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>

            <div className="flex-grow overflow-y-auto p-4">
              {modalView === 'categories' && (
                <div className="w-full">
                  {categories.map((category) => {
                    // Check if this specific category is open
                    const isCategoryOpen = openCategory === category;

                    return (
                      <div key={category} className="mb-4 border rounded-md overflow-hidden border-purple-200">
                        <button
                          className="w-full font-semibold bg-purple-50 p-3 text-left flex justify-between items-center text-purple-700"
                          onClick={() => toggleCategory(category)}
                        >
                          <span>{category}</span>
                          <span>{isCategoryOpen ? '−' : '+'}</span>
                        </button>
                        {isCategoryOpen && (
                          <div className="p-2 space-y-2 bg-white">
                            {recipes
                              .filter(recipe => recipe.category === category)
                              .map(recipe => (
                                <div
                                  key={recipe.id}
                                  className="p-2 border-b border-purple-100 cursor-pointer hover:bg-purple-50 flex justify-between items-center"
                                  onClick={() => {
                                    setSelectedRecipe(recipe);
                                    setModalView('details');
                                  }}
                                >
                                  <div>
                                    <p className="font-medium text-purple-800">{recipe.name}</p>
                                    <p className="text-sm text-purple-500">{truncateText(recipe.recipe)}</p>
                                  </div>
                                  <button
                                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1 rounded text-sm hover:from-pink-600 hover:to-orange-600 transition-all duration-300 shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddRecipeToMealPlan(recipe);
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recipe Details */}
              {modalView === 'details' && selectedRecipe && (
                <div className="w-full">
                  <button
                    className="mb-4 flex items-center text-purple-600 hover:text-purple-800"
                    onClick={() => setModalView('categories')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Categories
                  </button>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-purple-200">
                    <h3 className="text-xl font-semibold mb-2 text-purple-700">{selectedRecipe.name}</h3>
                    <p className="text-sm text-pink-500 mb-4">Category: {selectedRecipe.category}</p>
                    <div className="h-0.5 w-32 bg-gradient-to-r from-yellow-300 to-amber-400 mb-4"></div>

                    <div className="mb-6">
                      <h4 className="font-medium text-purple-700 mb-2 border-b pb-1 border-purple-200">Ingredients:</h4>
                      {selectedRecipe.ingredients.length > 0 ? (
                        <ul className="list-disc ml-5 space-y-1">
                          {selectedRecipe.ingredients.map((ingredient, idx) => (
                            <li key={idx} className="text-purple-600">{ingredient}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-purple-400 italic">No ingredients listed</p>
                      )}
                    </div>
                    <div className="mb-6">
                      <h4 className="font-medium text-purple-700 mb-2 border-b pb-1 border-purple-200">Recipe:</h4>
                      <p className="text-purple-600 whitespace-pre-line">{selectedRecipe.recipe || "No recipe instructions available"}</p>
                    </div>
                    <div className="flex space-x-3 mt-6">
                      <button
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:from-purple-700 hover:to-pink-600 flex items-center shadow-md transition-all duration-300"
                        onClick={() => handleAddRecipeToMealPlan(selectedRecipe)}
                      >
                        <Plus size={16} className="mr-1" /> Add to Meal Plan
                      </button>
                      <button
                        className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded hover:from-pink-600 hover:to-orange-600 flex items-center shadow-md transition-all duration-300"
                      >
                        <Edit3 size={16} className="mr-1" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlannerApp;