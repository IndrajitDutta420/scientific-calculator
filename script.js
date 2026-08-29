const display = document.getElementById('display');
let lastAnswer = 0;
let memory = 0;

window.onload = () => {
    display.focus();
    display.selectionStart = display.value.length;
    display.selectionEnd = display.value.length;
    initConverter(); 
};

// ==========================================
//   SIDEBAR DRAG-TO-RESIZE ENGINE
// ==========================================
const resizer = document.getElementById('resizer');
const sidebar = document.getElementById('tools');
let isResizing = false;
let startX, startWidth;

resizer.addEventListener('mousedown', function(e) {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth; 
    
    document.body.style.cursor = 'ew-resize';
    resizer.classList.add('active-resizer');
    
    // Disable smooth transition during drag for zero lag
    sidebar.style.transition = 'none'; 
    e.preventDefault(); 
});

document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    
    let deltaX = startX - e.clientX; 
    
    // Because the container is flex-centered, resizing pushes both sides. 
    // We multiply delta by 2 to keep the resizer perfectly locked under the mouse!
    let newWidth = startWidth + (deltaX * 2);
    
    if (newWidth < 280) newWidth = 280; // Min width limit
    if (newWidth > 600) newWidth = 600; // Max width limit
    
    document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
});

document.addEventListener('mouseup', function() {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        resizer.classList.remove('active-resizer');
        
        // Re-enable smooth transition for the close/open toggle
        sidebar.style.transition = ''; 
    }
});

// ---- Mobile Mode Toggle ----
function toggleMobileMode() {
    const isMobileMode = document.getElementById('mobile-mode-switch').checked;
    if (isMobileMode) { display.setAttribute('inputmode', 'none'); } 
    else { display.removeAttribute('inputmode'); }
    display.focus();
}

function showTools() {
    sidebar.classList.toggle('active');
}

// ---- UI Engine ----
function insert(val) {
    display.focus(); 
    if (display.value === 'Error') display.value = '0';

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

    if (start === end && start > 0) { display.setRangeText("", start - 1, end, "end"); } 
    else if (start !== end) { display.setRangeText("", start, end, "end"); }

    if (display.value === "") {
        display.value = "0";
        display.selectionStart = 1;
        display.selectionEnd = 1;
    }
}

function insertAns() { insert('Ans'); }

// ---- Memory Functions ----
function memoryPlus() {
    try { calculate(); memory += parseFloat(display.value) || 0; display.value = "0"; display.focus(); display.selectionStart = 1; display.selectionEnd = 1; } catch(e) {}
}
function memoryMinus() {
    try { calculate(); memory -= parseFloat(display.value) || 0; display.value = "0"; display.focus(); display.selectionStart = 1; display.selectionEnd = 1; } catch(e) {}
}
function memoryRecall() { insert(memory.toString()); }

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
        '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9', '⁻':'−', '⁺':'+', 'ˣ':'×', '·':'.'
    };

    exp = exp.replace(/⁽([^⁾]*)⁾?/g, (match, inner) => {
        let standard = inner.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·]/g, char => reverseSuperMap[char] || char);
        return '**(' + standard + ')';
    });

    exp = exp.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, match => {
        let standard = match.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, char => reverseSuperMap[char] || char);
        return '**(' + standard + ')';
    });

    exp = exp.replace(/×10\^/g, '*10**').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E').replace(/Ans/g, lastAnswer).replace(/²/g, '**2').replace(/³/g, '**3').replace(/⁻¹/g, '**-1').replace(/\^/g, '**');
    exp = exp.replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/asin\(/g, 'Math.asin(').replace(/acos\(/g, 'Math.acos(').replace(/atan\(/g, 'Math.atan(').replace(/sinh\(/g, 'Math.sinh(').replace(/cosh\(/g, 'Math.cosh(').replace(/tanh\(/g, 'Math.tanh(').replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(').replace(/x√\(/g, 'nthRoot(').replace(/∛\(/g, 'Math.cbrt(').replace(/√\(/g, 'Math.sqrt(').replace(/Pol\(/g, 'polar(').replace(/Rec\(/g, 'rect(').replace(/ENG\(/g, 'engFormat(').replace(/ab\/c\(/g, 'frac(').replace(/d\/c\(/g, 'frac(').replace(/dms\(/g, 'dmsToDec(');
    exp = exp.replace(/deg\(/g, 'toDeg(').replace(/rad\(/g, 'toRad(').replace(/%/g, '/100');
    exp = exp.replace(/(\d+)C(\d+)/g, 'nCr($1,$2)').replace(/(\d+)P(\d+)/g, 'nPr($1,$2)').replace(/(\d+)!/g, 'fact($1)');

    try {
        const compute = new Function('nCr', 'nPr', 'fact', 'toDeg', 'toRad', 'polar', 'rect', 'engFormat', 'frac', 'dmsToDec', 'nthRoot', 'return ' + exp);
        let result = compute(nCr, nPr, fact, toDeg, toRad, polar, rect, engFormat, frac, dmsToDec, nthRoot);
        if (!Number.isInteger(result) && typeof result === 'number') result = parseFloat(result.toPrecision(12));
        display.value = result.toString();
        lastAnswer = result; 
        display.focus();
        display.selectionStart = display.value.length;
        display.selectionEnd = display.value.length;
    } catch (error) {
        display.value = 'Error'; display.focus(); setTimeout(clearDisplay, 1500);
    }
}

// ---- STRICT KEYBOARD FILTER ----
display.addEventListener('keydown', function(event) {
    if (event.key.length > 1 || event.ctrlKey || event.metaKey || event.key === ',') return;
    const allowedCharacters = /^[0-9\+\-\*\/\.\(\)\^!%=]$/;
    if (!allowedCharacters.test(event.key)) event.preventDefault(); 
});

// ---- NATIVE KEYBOARD TYPING HANDLER (MAGIC FORMATTING) ----
display.addEventListener('input', function() {
    let cursor = display.selectionStart;
    let originalValue = display.value;
    let newValue = originalValue.replace(/^0+(?=\d)/, '');
    newValue = newValue.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');

    const superMap = { '0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹', '−':'⁻', '-': '⁻', '+': '⁺', '(': '⁽', ')': '⁾', '×': 'ˣ', '÷': '÷', '.': '·' };
    
    newValue = newValue.replace(/\^\(/g, '⁽');
    newValue = newValue.replace(/\^([0-9−])/g, (m, p1) => superMap[p1]);
    
    while (/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/.test(newValue)) newValue = newValue.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/g, (m, p1, p2) => p1 + superMap[p2]);
    while (/(⁽[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·÷]*)([0-9−\+\×\÷\(\)\.])/.test(newValue)) newValue = newValue.replace(/(⁽[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·÷]*)([0-9−\+\×\÷\(\)\.])/g, (m, p1, p2) => p1 + (superMap[p2] || p2));

    if (originalValue !== newValue) {
        display.value = newValue;
        display.selectionStart = display.selectionEnd = cursor + (newValue.length - originalValue.length);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === '=') { calculate(); event.preventDefault(); } 
    else if (event.key === 'Escape') { clearDisplay(); event.preventDefault(); }
});

// ==========================================
//   UNIVERSAL CONVERTER ENGINE (SKETCH UI)
// ==========================================
const convertData = {
    angle: { Degree: 1, Radian: 180 / Math.PI, Gradian: 0.9 },
    area: { 'Square Meter': 1, 'Square Kilometer': 1000000, 'Square Mile': 2589988.11, Acre: 4046.86, Hectare: 10000, 'Square Foot': 0.092903 },
    length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.34, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 },
    mass: { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, 'Metric Ton': 1000, Pound: 0.453592, Ounce: 0.0283495 },
    speed: { 'Meter per sec': 1, 'Km per hour': 0.277778, 'Miles per hour': 0.44704, Knot: 0.514444 },
    time: { Second: 1, Minute: 60, Hour: 3600, Day: 86400, Week: 604800, Year: 31536000 },
    volume: { 'Cubic Meter': 1, Liter: 0.001, Milliliter: 0.000001, Gallon: 0.00378541, Quart: 0.000946353, Pint: 0.000473176 },
    temperature: { Celsius: 'C', Fahrenheit: 'F', Kelvin: 'K' }
};

function initConverter() {
    const category = document.getElementById('conv-category').value;
    const select1 = document.getElementById('conv-unit1');
    const select2 = document.getElementById('conv-unit2');
    
    select1.innerHTML = select2.innerHTML = '';
    const units = Object.keys(convertData[category]);
    
    units.forEach(unit => {
        select1.options.add(new Option(unit, unit));
        select2.options.add(new Option(unit, unit));
    });

    if (units.length > 1) select2.selectedIndex = 1;
    document.getElementById('conv-input1').value = '1';
    convertValue(1);
}

function swapConverter() {
    const i1 = document.getElementById('conv-input1'), i2 = document.getElementById('conv-input2');
    const s1 = document.getElementById('conv-unit1'), s2 = document.getElementById('conv-unit2');
    
    let tempIdx = s1.selectedIndex; s1.selectedIndex = s2.selectedIndex; s2.selectedIndex = tempIdx;
    let tempVal = i1.value; i1.value = i2.value; i2.value = tempVal;
    
    convertValue(1);
}

function convertValue(source) {
    const category = document.getElementById('conv-category').value;
    let fromInput = document.getElementById(source === 1 ? 'conv-input1' : 'conv-input2');
    let targetInput = document.getElementById(source === 1 ? 'conv-input2' : 'conv-input1');
    let fromUnit = document.getElementById(source === 1 ? 'conv-unit1' : 'conv-unit2').value;
    let targetUnit = document.getElementById(source === 1 ? 'conv-unit2' : 'conv-unit1').value;

    if (fromInput.value === '') { targetInput.value = ''; return; }
    let val = parseFloat(fromInput.value), result = 0;

    if (category === 'temperature') {
        let cVal = fromUnit === 'Celsius' ? val : fromUnit === 'Fahrenheit' ? (val - 32) * 5/9 : val - 273.15;
        result = targetUnit === 'Celsius' ? cVal : targetUnit === 'Fahrenheit' ? (cVal * 9/5) + 32 : cVal + 273.15;
    } else {
        result = (val * convertData[category][fromUnit]) / convertData[category][targetUnit];
    }
    
    targetInput.value = parseFloat(result.toPrecision(7));
}
