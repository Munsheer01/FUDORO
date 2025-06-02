import React, { useState } from "react";
import styles from "./MealBoxScreen.module.css"; // Import CSS module
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";
import MealBoxImg from "../assets/MealBox.jpg";

// Data for meal boxes and food items
const mealBoxOptionsData = [
  {
    id: "twin_treat",
    name: "Twin Treat Box",
    description: "Two Compartments of Flavorful Delight",
    compartments: 2,
    compartmentNames: ["Main Course", "Side Dish"],
  },
  {
    id: "triple_delight",
    name: "Triple Delight Box",
    description: "Three Compartments of Goodness",
    compartments: 3,
    compartmentNames: ["Appetizer", "Main Course", "Dessert"],
  },
  {
    id: "quad_feast",
    name: "Quad Feast Box",
    description: "Four Compartments for a Hearty Meal",
    compartments: 4,
    compartmentNames: ["Appetizer", "Flavored Rice", "Curry", "Side Dish"],
  },
  {
    id: "mega_meal",
    name: "Mega Meal Box",
    description: "Five Compartments of Ultimate Delight",
    compartments: 5,
    compartmentNames: [
      "Appetizer",
      "Flavored Rice",
      "Curry",
      "Crispy Fry",
      "Dessert",
    ],
  },
  {
    id: "super_six",
    name: "Super Six Box",
    description: "Six Compartments, a True Feast!",
    compartments: 6,
    compartmentNames: [
      "Appetizer",
      "Soup",
      "Flavored Rice",
      "Curry",
      "Crispy Fry",
      "Dessert",
    ],
  },
  {
    id: "septa_special",
    name: "Septa Special Box",
    description: "Seven Compartments for the Grandest Meal",
    compartments: 7,
    compartmentNames: [
      "Appetizer",
      "Soup",
      "Salad",
      "Flavored Rice",
      "Curry",
      "Crispy Fry",
      "Dessert",
    ],
  },
];

const foodItemsData = {
  Appetizer: [
    {
      id: "paneer_tikka",
      name: "Paneer Tikka",
      description: "Grilled cottage cheese cubes",
    },
    { id: "gobi_65", name: "Gobi 65", description: "Spicy fried cauliflower" },
    {
      id: "chicken_65",
      name: "Chicken 65",
      description: "Spicy fried chicken",
    },
    {
      id: "veg_spring_roll",
      name: "Veg Spring Roll",
      description: "Crispy fried rolls with veggie filling",
    },
  ],
  "Main Course": [
    {
      id: "veg_noodles",
      name: "Veg Noodles",
      description: "Stir-fried noodles with vegetables",
    },
    {
      id: "chicken_fried_rice",
      name: "Chicken Fried Rice",
      description: "Rice stir-fried with chicken and veggies",
    },
    {
      id: "dal_makhani",
      name: "Dal Makhani",
      description: "Creamy black lentils and kidney beans",
    },
  ],
  "Side Dish": [
    {
      id: "aloo_gobi",
      name: "Aloo Gobi",
      description: "Potatoes and cauliflower stir-fry",
    },
    {
      id: "raita",
      name: "Raita",
      description: "Yogurt with spices and vegetables",
    },
    {
      id: "green_salad",
      name: "Green Salad",
      description: "Fresh mixed greens",
    },
  ],
  "Flavored Rice": [
    {
      id: "veg_biryani",
      name: "Veg Biryani",
      description: "Aromatic rice with mixed vegetables",
    },
    {
      id: "chicken_fry_biryani",
      name: "Chicken Fry Biryani",
      description: "Biryani with fried chicken pieces",
    },
    {
      id: "jeera_rice",
      name: "Jeera Rice",
      description: "Cumin flavored rice",
    },
    {
      id: "lemon_rice",
      name: "Lemon Rice",
      description: "Tangy lemon flavored rice",
    },
  ],
  Curry: [
    {
      id: "paneer_butter_masala",
      name: "Paneer Butter Masala",
      description: "Rich and creamy paneer curry",
    },
    {
      id: "fish_curry",
      name: "Fish Curry",
      description: "Spicy and tangy fish curry",
    },
    {
      id: "dal_tadka",
      name: "Dal Tadka",
      description: "Yellow lentils with tempering",
    },
    {
      id: "chicken_chettinad",
      name: "Chicken Chettinad",
      description: "Spicy South Indian chicken curry",
    },
  ],
  "Crispy Fry": [
    { id: "aloo_fry", name: "Aloo Fry", description: "Crispy fried potatoes" },
    {
      id: "mushroom_fry",
      name: "Mushroom Fry",
      description: "Spicy fried mushrooms",
    },
    { id: "bhindi_fry", name: "Bhindi Fry", description: "Crispy fried okra" },
    {
      id: "chicken_pakora",
      name: "Chicken Pakora",
      description: "Crispy chicken fritters",
    },
  ],
  Dessert: [
    {
      id: "gulab_jamun",
      name: "Gulab Jamun",
      description: "Sweet milk-solid balls in syrup",
    },
    {
      id: "rasmalai",
      name: "Rasmalai",
      description: "Cheese dumplings in sweetened milk",
    },
    {
      id: "gajar_halwa",
      name: "Gajar Halwa",
      description: "Sweet carrot pudding",
    },
    {
      id: "fruit_custard",
      name: "Fruit Custard",
      description: "Creamy custard with fresh fruits",
    },
  ],
  Soup: [
    {
      id: "tomato_soup",
      name: "Tomato Soup",
      description: "Classic creamy tomato soup",
    },
    {
      id: "veg_manchow_soup",
      name: "Veg Manchow Soup",
      description: "Spicy and tangy vegetable soup",
    },
    {
      id: "chicken_clear_soup",
      name: "Chicken Clear Soup",
      description: "Light and healthy chicken broth",
    },
  ],
  Salad: [
    {
      id: "kachumber_salad",
      name: "Kachumber Salad",
      description: "Indian cucumber, tomato, onion salad",
    },
    {
      id: "caesar_salad",
      name: "Caesar Salad",
      description: "Classic Caesar salad with croutons",
    },
    {
      id: "fruit_salad",
      name: "Fruit Salad",
      description: "Mix of fresh seasonal fruits",
    },
  ],
};

function MealBoxScreen() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Box, 2: Customize, 3: Summary
  const [selectedBox, setSelectedBox] = useState(null);
  const [itemSelections, setItemSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [compartmentErrors, setCompartmentErrors] = useState({});
  const [globalValidationMessage, setGlobalValidationMessage] = useState("");
  const [cartMessage, setCartMessage] = useState({ text: "", type: "" });

  const getProgressText = () => {
    if (currentStep === 1) return "Step 1 of 3: Select Box Size";
    if (currentStep === 2 && selectedBox)
      return `Step 2 of 3: Customize ${selectedBox.name}`;
    if (currentStep === 3) return "Step 3 of 3: Review & Add to Cart";
    return "";
  };

  const handleSelectBox = (boxId) => {
    const box = mealBoxOptionsData.find((b) => b.id === boxId);
    setSelectedBox(box);
    setItemSelections({});
    setCompartmentErrors({});
    setGlobalValidationMessage("");
    setActiveAccordion(box && box.compartments > 0 ? `compartment_0` : null);
    setCurrentStep(2);
  };

  const handleAccordionToggle = (compartmentKey) => {
    setActiveAccordion(
      activeAccordion === compartmentKey ? null : compartmentKey
    );
  };

  const handleSelectItem = (
    compartmentKey,
    itemId,
    itemName,
    compartmentName
  ) => {
    setItemSelections((prev) => ({
      ...prev,
      [compartmentKey]: { itemId, itemName, compartmentName },
    }));
    setCompartmentErrors((prev) => ({ ...prev, [compartmentKey]: "" }));
    setGlobalValidationMessage("");

    const currentCompartmentIndex = parseInt(compartmentKey.split("_")[1]);
    if (selectedBox && currentCompartmentIndex < selectedBox.compartments - 1) {
      const nextCompartmentKey = `compartment_${currentCompartmentIndex + 1}`;
      if (!itemSelections[nextCompartmentKey]) {
        setActiveAccordion(nextCompartmentKey);
      } else {
        setActiveAccordion(null);
      }
    } else {
      setActiveAccordion(null);
    }
  };

  const validateSelections = () => {
    let isValid = true;
    const errors = {};
    if (!selectedBox) return false;

    for (let i = 0; i < selectedBox.compartments; i++) {
      const compartmentKey = `compartment_${i}`;
      if (!itemSelections[compartmentKey]) {
        isValid = false;
        errors[compartmentKey] = `Please select 1 item for ${
          selectedBox.compartmentNames[i] || `Compartment ${i + 1}`
        }.`;
      }
    }
    setCompartmentErrors(errors);
    if (!isValid) {
      setGlobalValidationMessage(
        "Please make a selection for all compartments."
      );
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        setActiveAccordion(firstErrorKey);
      }
    } else {
      setGlobalValidationMessage("");
    }
    return isValid;
  };

  const handleReviewOrder = () => {
    if (validateSelections()) {
      setCurrentStep(3);
    }
  };

  const handleAddToCart = () => {
    if (Object.keys(itemSelections).length < (selectedBox?.compartments || 0)) {
      setCartMessage({
        text: "Please complete all selections before adding to cart.",
        type: "error",
      });
      setTimeout(() => setCartMessage({ text: "", type: "" }), 3000);
      return;
    }

    const order = {
      box: selectedBox,
      selections: itemSelections,
      quantity: quantity,
    };
    console.log("Order Added to Cart:", order);

    setCartMessage({
      text: `${quantity} x ${selectedBox.name} added to cart!`,
      type: "success",
    });

    setTimeout(() => {
      setCurrentStep(1);
      setSelectedBox(null);
      setItemSelections({});
      setQuantity(1);
      setActiveAccordion(null);
      setCompartmentErrors({});
      setGlobalValidationMessage("");
      setCartMessage({ text: "", type: "" });
    }, 2000);
  };

  // Render functions for each step
  const renderStep1 = () => (
    <section id="step1BoxSelection" className={styles.spaceY4}>
      {mealBoxOptionsData.map((box) => (
        <div key={box.id} className={styles.mealBoxCard}>
          <div className={styles.mealBoxImgWrapper}>
            <img
              src={MealBoxImg}
              alt="Meal Box"
              className={styles.mealBoxImg}
            />
          </div>
          <div className={styles.mealBoxCardContent}>
            <h3 className={styles.fudoroHeading}>{box.name}</h3>
            <p className={styles.fudoroText}>{box.description}</p>
            <button
              onClick={() => handleSelectBox(box.id)}
              className={styles.customizeBtn}
            >
              Customize
            </button>
          </div>
        </div>
      ))}
    </section>
  );

  const renderStep2 = () => {
    if (!selectedBox) return null;
    return (
      <section id="step2CustomizeCompartments">
        <div className={styles.flexRow}>
          <button
            onClick={() => {
              setCurrentStep(1);
              setGlobalValidationMessage("");
              setCompartmentErrors({});
            }}
            className={styles.backBtn}
          >
            ← Back
          </button>
          <h2 id="customizationHeader" className={styles.fudoroHeading}>
            Customize Your {selectedBox.name}
          </h2>
        </div>
        <div id="compartmentsContainer" className={styles.spaceY3}>
          {Array.from({ length: selectedBox.compartments }).map((_, i) => {
            const compartmentKey = `compartment_${i}`;
            const compartmentName =
              selectedBox.compartmentNames[i] || `Compartment ${i + 1}`;
            const itemsForCompartment =
              foodItemsData[compartmentName] || foodItemsData["Main Course"];
            const isOpen = activeAccordion === compartmentKey;

            return (
              <div key={compartmentKey} className={styles.accordionItem}>
                <div
                  className={`${styles.accordionHeader} ${
                    isOpen ? styles.active : ""
                  }`}
                  onClick={() => handleAccordionToggle(compartmentKey)}
                >
                  <span className={styles.fudoroHeading}>
                    {compartmentName}{" "}
                    <small className={styles.fudoroText}>(Choose 1 item)</small>
                  </span>
                  <span
                    className={`${styles.chevronIcon} ${
                      isOpen ? styles.rotate180 : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
                <div
                  className={styles.accordionContent}
                  style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    padding: isOpen ? "1rem" : "0 1rem",
                  }}
                >
                  <div
                    className={styles.scrollableList}
                    style={{ maxHeight: isOpen ? "180px" : "0px" }}
                  >
                    {itemsForCompartment.map((item) => (
                      <div
                        key={item.id}
                        className={`${styles.foodItemCard} ${
                          itemSelections[compartmentKey]?.itemId === item.id
                            ? styles.selected
                            : ""
                        }`}
                        onClick={() =>
                          handleSelectItem(
                            compartmentKey,
                            item.id,
                            item.name,
                            compartmentName
                          )
                        }
                      >
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <p className={styles.itemDescription}>
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  {compartmentErrors[compartmentKey] && (
                    <div className={styles.validationMessage}>
                      {compartmentErrors[compartmentKey]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {globalValidationMessage && (
          <div
            id="globalValidationMessage"
            className={styles.validationMessage}
          >
            {globalValidationMessage}
          </div>
        )}
        <button
          id="reviewOrderButton"
          onClick={handleReviewOrder}
          className={styles.customizeBtn}
        >
          Review Order
        </button>
      </section>
    );
  };

  const renderStep3 = () => {
    if (!selectedBox) return null;
    return (
      <section id="step3CartSummary">
        <div className={styles.flexRow}>
          <button onClick={() => setCurrentStep(2)} className={styles.backBtn}>
            ← Back
          </button>
          <h2 className={styles.fudoroHeading}>Order Summary</h2>
        </div>
        <div id="summaryContainer" className={styles.summaryContainer}>
          <h3 className={styles.fudoroHeading}>Your {selectedBox.name}:</h3>
          <ul className={styles.summaryList}>
            {Array.from({ length: selectedBox.compartments }).map((_, i) => {
              const compartmentKey = `compartment_${i}`;
              const selection = itemSelections[compartmentKey];
              return (
                <li key={i} className={styles.fudoroText}>
                  <strong className={styles.fudoroHeading}>
                    {selection?.compartmentName ||
                      selectedBox.compartmentNames[i] ||
                      `Compartment ${i + 1}`}
                    :
                  </strong>
                  &nbsp;
                  {selection ? (
                    selection.itemName
                  ) : (
                    <span className={styles.errorText}>Not selected</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.quantitySection}>
          <label htmlFor="quantity" className={styles.fudoroText}>
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            className={styles.quantityInput}
          />
        </div>
        {cartMessage.text && (
          <div
            className={
              cartMessage.type === "success"
                ? styles.fudoroGreenText
                : styles.errorText
            }
          >
            {cartMessage.text}
          </div>
        )}
        <button
          id="addToCartButton"
          onClick={handleAddToCart}
          className={styles.customizeBtn}
        >
          Add to Cart
        </button>
      </section>
    );
  };

  return (
    <div className={styles.fudoroPageContainer}>
      <GlobalHeader />
      <div className={styles.fudoroAppWrapper}>
        <header className={styles.header}>
          <h1 className={styles.fudoroHeading}>FUDORO</h1>
          <p className={styles.fudoroText}>Customize Your Meal Box</p>
        </header>

        <div id="progressIndicator" className={styles.progressIndicator}>
          {getProgressText()}
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
      <GlobalFooter />
    </div>
  );
}

export default MealBoxScreen;
