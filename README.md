<div align="center">
  
# 🧮 Advanced Scientific Calculator
*A high-performance, dependency-free computation engine built natively for the modern web.*

[![Live Demo](https://img.shields.io/badge/🔴_Live_Demo-0a84ff?style=for-the-badge)](https://indrajitdutta420.github.io/scientific-calculator/)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-4cd137?style=for-the-badge)](#)

<br />

<!-- 💡 TIP: Upload an image of your calculator named "screenshot.png" to your repository to make this image appear! -->
<img src="Screenshot 2026-07-21 185306.png" alt="Scientific Calculator Interface" width="700" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

</div>

---

## 📑 Table of Contents
1. [Live Preview](#-live-preview)
2. [Engineering Highlights](#-engineering-highlights--architecture)
3. [Mathematical Toolset](#-mathematical-toolset)
4. [UI/UX Design Specs](#-uiux-design-specs)
5. [Local Installation](#️-local-installation)
6. [License](#-license)

---

## 🔗 Live Preview
Access the fully functional web application here:  
**👉 [indrajitdutta420.github.io/scientific-calculator](https://indrajitdutta420.github.io/scientific-calculator/)**

---

## 🚀 Engineering Highlights & Architecture

Bypassing static layouts and bulky frameworks (like `Math.js`), this project was engineered from the ground up to solve complex UI/UX and parsing challenges natively.

### ⚡ Native DOM Cursor Manipulation
The calculator display is a fully interactive input node, not a static string.
* **Precision Injection:** Utilizes the `HTMLInputElement.setRangeText()` API combined with `selectionStart` and `selectionEnd` offset tracking. Users can click anywhere in a complex equation to inject or delete data non-destructively.
* **Lexical Formatting:** An active event listener intercepts physical keystrokes, instantly mapping raw keyboard characters (`*`, `/`, `-`) to aesthetic Unicode operators (`×`, `÷`, `−`) in real-time.

### 📱 Frictionless Mobile OS Override
A major flaw in mobile web calculators is the device's native virtual keyboard pushing the UI off-screen. 
* **The Solution:** A dedicated **Mobile Mode** toggle dynamically alters the DOM by injecting the `inputmode="none"` attribute. This forces mobile operating systems to keep the cursor active for highlighting while completely suppressing the virtual keyboard, creating a seamless progressive web app (PWA) experience.

### ⚙️ Dependency-Free Parsing Engine
* **Regex Translation:** Sequential Regular Expressions map visual aesthetic symbols (`²`, `⁻¹`, `∛`, `×10ˣ`) into standard JavaScript arithmetic.
* **Restricted Execution:** Evaluates expressions within a strictly scoped `Function` constructor, passing in only explicitly allowed helper functions (like `nCr`, `polar`, `fact`) to ensure secure, sandboxed calculations without the security flaws of global `eval()`.

---

## 🧰 Mathematical Toolset

| Category | Supported Operations |
| :--- | :--- |
| **🧠 Core Math** | Addition, Subtraction, Multiplication, Division, Fractions (`a b/c`), Percentages |
| **📐 Trigonometry** | `sin`, `cos`, `tan`, Inverses (`sin⁻¹`), Hyperbolic variants (`sinh`, `cosh`, `tanh`) |
| **📈 Algebra** | Squares (`x²`), Cubes (`x³`), Custom Powers (`xʸ`), Roots (`√`, `∛`, `x√`), `log`, `ln` |
| **🎲 Combinatorics**| Permutations (`nPr`), Combinations (`nCr`), Factorials (`x!`), PRNG (`Ran#`) |
| **⚙️ Engineering** | `Rad ➔ Deg` conversions, Engineering formatting (`ENG`), Polar/Rectangular Coordinates |
| **💾 State Memory** | Memory Bank (`M+`, `M-`, `RCL`), Dynamic Previous Answer recall (`Ans`) |

---

## 🎨 UI/UX Design Specs

* **Responsive CSS Grid Layout:** The UI architecture is managed via `display: grid`, ensuring mathematical operators align flawlessly across varying viewport widths.
* **Hardware-Accelerated Sidebar:** Complex tools are housed in a sliding side-panel utilizing `transform` and `transition` cubic-bezier curves to prevent main-thread blocking.
* **Professional Dark Mode:** Themed using CSS Variables (`:root`) to deliver a high-contrast, low-eyestrain palette specifically designed for extended computation sessions.

---

## ⚙️ Local Installation

No build steps, bundlers, or package managers are required. 

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/indrajitdutta420/scientific-calculator.git](https://github.com/indrajitdutta420/scientific-calculator.git)
