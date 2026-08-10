const display = document.getElementById('display');
let lastAnswer = 0;
let memory = 0;

window.onload = () => {
    display.focus();
    display.selectionStart = display.value.length;
    display.selectionEnd = display.value.length;
    initConverter(); // Initializes the universal converter
};

// ---- Mobile Mode Toggle ----
function toggleMobileMode() {
    const isMobileMode = document.getElementById('mobile-mode-switch').checked;
    
    if (isMobileMode) {
        display.setAttribute('inputmode', 'none'); 
    } else {
        display.removeAttribute('inputmode');
    }
    
    display.focus();
}

function showTools() {
    document.getElementById('tools').classList.toggle('active');
}

// ---- UI Engine ----
function insert(val) {
    display.focus(); 
    
    if (display.value === 'Error') {
        display.value = '0';
    }

    let start = display.selectionStart;
    let end = display.selectionEnd;
    
    if (display.value === '0' && end <= 1) {
        if (!['×', '÷', '+', '−', '^', 'P', 'C', '!', '⁻¹', '²', '³'].includes(val)) {
            display.value = val;
            display.selectionStart = display.value.length;
            display.selectionEnd = display.value.length;
            
            display.dispatchEvent(new Event('input')); 
            return;
        }
    }

    display.setRangeText(val, start, end, "end");
    display.dispatchEvent(new Event('input')); 
}

function clearDisplay() { 
    display.value = '0'; 
    display.focus();
    display.selectionStart = 1;
    display.selectionEnd = 1;
}

function deleteChar() {
    display.focus();
    if (display.value === 'Error') {
        display.value = '0';
        display.selectionStart = 1;
        display.selectionEnd = 1;
        return;
    }

    let start = display.selectionStart;
    let end = display.selectionEnd;

    if (start === end && start > 0) {
        display.setRangeText("", start - 1, end, "end");
    } else if (start !== end) {
        display.setRangeText("", start, end, "end");
    }

    if (display.value === "") {
        display.value = "0";
        display.selectionStart = 1;
        display.selectionEnd = 1;
    }
}

function insertAns() { insert('Ans'); }

// ---- Memory Functions ----
function memoryPlus() {
    try {
        calculate(); 
        memory += parseFloat(display.value) || 0;
        display.value = "0";
        display.focus();
        display.selectionStart = 1;
        display.selectionEnd = 1;
    } catch(e) {}
}

function memoryMinus() {
    try {
        calculate();
        memory -= parseFloat(display.value) || 0;
        display.value = "0";
        display.focus();
        display.selectionStart = 1;
        display.selectionEnd = 1;
    } catch(e) {}
}

function memoryRecall() {
    insert(memory.toString());
}

// ---- Math Engine Helpers ----
function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }
function nCr(n, r) { return r > n ? 0 : fact(n) / (fact(r) * fact(n - r)); }
function nPr(n, r) { return r > n ? 0 : fact(n) / fact(n - r); }

function toDeg(rad) { return rad * (180 / Math.PI); }
function toRad(deg) { return deg * (Math.PI / 180); }

function polar(x, y) { return Math.hypot(x, y); } 
function rect(r, theta) { return r * Math.cos(theta); } 
function engFormat(num) { return Number(num).toExponential(3); } 
function frac(a, b) { return a / b; } 
function dmsToDec(d, m=0, s=0) { return d + (m/60) + (s/3600); }
function nthRoot(n, x) { return Math.pow(x, 1/n); }

// ---- Main Parser & Evaluator ----
function calculate() {
    let exp = display.value;
    if (!exp || exp === 'Error') return;

    const reverseSuperMap = {
        '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', 
        '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9', '⁻':'−', '⁺':'+', 
        'ˣ':'×', '·':'.'
    };

    exp = exp.replace(/⁽([^⁾]*)⁾?/g, (match, inner) => {
        let standard = inner.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·]/g, char => reverseSuperMap[char] || char);
        return '**(' + standard + ')';
    });

    exp = exp.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, match => {
        let standard = match.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, char => reverseSuperMap[char] || char);
        return '**(' + standard + ')';
    });

    exp = exp.replace(/×10\^/g, '*10**')
             .replace(/×/g, '*')
             .replace(/÷/g, '/')
             .replace(/−/g, '-')
             .replace(/π/g, 'Math.PI')
             .replace(/e/g, 'Math.E')
             .replace(/Ans/g, lastAnswer)
             .replace(/²/g, '**2')
             .replace(/³/g, '**3')
             .replace(/⁻¹/g, '**-1')
             .replace(/\^/g, '**');

    exp = exp.replace(/sin\(/g, 'Math.sin(')
             .replace(/cos\(/g, 'Math.cos(')
             .replace(/tan\(/g, 'Math.tan(')
             .replace(/asin\(/g, 'Math.asin(')
             .replace(/acos\(/g, 'Math.acos(')
             .replace(/atan\(/g, 'Math.atan(')
             .replace(/sinh\(/g, 'Math.sinh(')
             .replace(/cosh\(/g, 'Math.cosh(')
             .replace(/tanh\(/g, 'Math.tanh(')
             .replace(/log\(/g, 'Math.log10(') 
             .replace(/ln\(/g, 'Math.log(')    
             .replace(/x√\(/g, 'nthRoot(')
             .replace(/∛\(/g, 'Math.cbrt(')
             .replace(/√\(/g, 'Math.sqrt(')
             .replace(/Pol\(/g, 'polar(')
             .replace(/Rec\(/g, 'rect(')
             .replace(/ENG\(/g, 'engFormat(')
             .replace(/ab\/c\(/g, 'frac(')
             .replace(/d\/c\(/g, 'frac(')
             .replace(/dms\(/g, 'dmsToDec(');

    exp = exp.replace(/deg\(/g, 'toDeg(')
             .replace(/rad\(/g, 'toRad(')
             .replace(/%/g, '/100');

    exp = exp.replace(/(\d+)C(\d+)/g, 'nCr($1,$2)');
    exp = exp.replace(/(\d+)P(\d+)/g, 'nPr($1,$2)');
    exp = exp.replace(/(\d+)!/g, 'fact($1)');

    try {
        const compute = new Function(
            'nCr', 'nPr', 'fact', 'toDeg', 'toRad', 'polar', 'rect', 'engFormat', 'frac', 'dmsToDec', 'nthRoot',
            'return ' + exp
        );
        
        let result = compute(nCr, nPr, fact, toDeg, toRad, polar, rect, engFormat, frac, dmsToDec, nthRoot);

        if (!Number.isInteger(result) && typeof result === 'number') {
            result = parseFloat(result.toPrecision(12));
        }

        display.value = result.toString();
        lastAnswer = result; 
        
        display.focus();
        display.selectionStart = display.value.length;
        display.selectionEnd = display.value.length;
        
    } catch (error) {
        display.value = 'Error';
        display.focus();
        setTimeout(clearDisplay, 1500);
    }
}

// ---- STRICT KEYBOARD FILTER ----
display.addEventListener('keydown', function(event) {
    if (event.key.length > 1 || event.ctrlKey || event.metaKey) return; 
    if (event.key === ',') return;

    const allowedCharacters = /^[0-9\+\-\*\/\.\(\)\^!%=]$/;
    if (!allowedCharacters.test(event.key)) {
        event.preventDefault(); 
    }
});

// ---- NATIVE KEYBOARD TYPING HANDLER (MAGIC FORMATTING) ----
display.addEventListener('input', function() {
    let cursor = display.selectionStart;
    let originalValue = display.value;

    let newValue = originalValue.replace(/^0+(?=\d)/, '');
    newValue = newValue.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');

    const superMap = {
        '0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', 
        '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹', '−':'⁻', '-': '⁻',
        '+':'⁺', '(':'⁽', ')':'⁾', '×':'ˣ', '÷':'÷', '.':'·'
    };
    
    newValue = newValue.replace(/\^\(/g, '⁽');
    newValue = newValue.replace(/\^([0-9−])/g, (m, p1) => superMap[p1]);
    
    while (/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/.test(newValue)) {
        newValue = newValue.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/g, (m, p1, p2) => p1 + superMap[p2]);
    }
    
    while (/(⁽[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·÷]*)([0-9−\+\×\÷\(\)\.])/.test(newValue)) {
        newValue = newValue.replace(/(⁽[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·÷]*)([0-9−\+\×\÷\(\)\.])/g, (m, p1, p2) => p1 + (superMap[p2] || p2));
    }

    if (originalValue !== newValue) {
        display.value = newValue;
        let offset = newValue.length - originalValue.length;
        display.selectionStart = cursor + offset;
        display.selectionEnd = cursor + offset;
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === '=') {
        calculate();
        event.preventDefault(); 
    } 
    else if (event.key === 'Escape') {
        clearDisplay();
        event.preventDefault();
    }
});


// ==========================================
//   UNIVERSAL CONVERTER ENGINE (SKETCH UI)
// ==========================================

// Central Database of multi-pliers (Relative to a Base Unit)
const convertData = {
    angle: {
        Degree: 1,
        Radian: 180 / Math.PI,
        Gradian: 0.9
    },
    area: {
        'Square Meter': 1,
        'Square Kilometer': 1000000,
        'Square Mile': 2589988.11,
        Acre: 4046.86,
        Hectare: 10000,
        'Square Foot': 0.092903
    },
    length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Millimeter: 0.001,
        Mile: 1609.34,
        Yard: 0.9144,
        Foot: 0.3048,
        Inch: 0.0254
    },
    mass: {
        Kilogram: 1,
        Gram: 0.001,
        Milligram: 0.000001,
        'Metric Ton': 1000,
        Pound: 0.453592,
        Ounce: 0.0283495
    },
    speed: {
        'Meter per sec': 1,
        'Km per hour': 0.277778,
        'Miles per hour': 0.44704,
        Knot: 0.514444
    },
    time: {
        Second: 1,
        Minute: 60,
        Hour: 3600,
        Day: 86400,
        Week: 604800,
        Year: 31536000
    },
    volume: {
        'Cubic Meter': 1,
        Liter: 0.001,
        Milliliter: 0.000001,
        Gallon: 0.00378541,
        Quart: 0.000946353,
        Pint: 0.000473176
    },
    temperature: {
        Celsius: 'C',
        Fahrenheit: 'F',
        Kelvin: 'K'
    }
};

// Initializes dropdowns when category is changed
function initConverter() {
    const category = document.getElementById('conv-category').value;
    const select1 = document.getElementById('conv-unit1');
    const select2 = document.getElementById('conv-unit2');
    
    // Clear existing options
    select1.innerHTML = '';
    select2.innerHTML = '';
    
    // Populate new options
    const units = Object.keys(convertData[category]);
    units.forEach(unit => {
        select1.options.add(new Option(unit, unit));
        select2.options.add(new Option(unit, unit));
    });

    // Set defaults (Unit 1 as first, Unit 2 as second if available)
    if (units.length > 1) {
        select2.selectedIndex = 1;
    }
    
    // Set default input 1 and trigger calculate
    document.getElementById('conv-input1').value = '1';
    convertValue(1);
}

// Swaps the values and units in the two boxes
function swapConverter() {
    const input1 = document.getElementById('conv-input1');
    const input2 = document.getElementById('conv-input2');
    const select1 = document.getElementById('conv-unit1');
    const select2 = document.getElementById('conv-unit2');

    // Swap select options
    let tempIndex = select1.selectedIndex;
    select1.selectedIndex = select2.selectedIndex;
    select2.selectedIndex = tempIndex;

    // Swap input values and re-calculate from left to right
    let tempVal = input1.value;
    input1.value = input2.value;
    input2.value = tempVal;
    
    convertValue(1);
}

// The core math engine for universal conversion
function convertValue(source) {
    const category = document.getElementById('conv-category').value;
    
    const input1 = document.getElementById('conv-input1');
    const input2 = document.getElementById('conv-input2');
    const unit1 = document.getElementById('conv-unit1').value;
    const unit2 = document.getElementById('conv-unit2').value;

    let fromInput = source === 1 ? input1 : input2;
    let targetInput = source === 1 ? input2 : input1;
    let fromUnit = source === 1 ? unit1 : unit2;
    let targetUnit = source === 1 ? unit2 : unit1;

    if (fromInput.value === '') {
        targetInput.value = '';
        return;
    }

    let val = parseFloat(fromInput.value);
    let result = 0;

    // Special logic required for Temperature formulas
    if (category === 'temperature') {
        let celsiusVal = 0;
        
        // Step 1: Convert to base (Celsius)
        if (fromUnit === 'Celsius') celsiusVal = val;
        else if (fromUnit === 'Fahrenheit') celsiusVal = (val - 32) * 5/9;
        else if (fromUnit === 'Kelvin') celsiusVal = val - 273.15;

        // Step 2: Convert from base to target
        if (targetUnit === 'Celsius') result = celsiusVal;
        else if (targetUnit === 'Fahrenheit') result = (celsiusVal * 9/5) + 32;
        else if (targetUnit === 'Kelvin') result = celsiusVal + 273.15;
    } 
    // Standard Multiplication Logic for all other units
    else {
        let fromFactor = convertData[category][fromUnit];
        let targetFactor = convertData[category][targetUnit];
        
        let valInBase = val * fromFactor;
        result = valInBase / targetFactor;
    }

    // Format beautifully to 7 decimal places, stripping trailing zeros
    targetInput.value = parseFloat(result.toPrecision(7));
}
