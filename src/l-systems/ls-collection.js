(function () {

"use strict";

var storedCollections = JSON.parse(localStorage.lsCollections || "{}");

storedCollections.bundled = {

"bush 1": {
	axiom: "F",
	rules: {
		F: "F[+FF][-FF]F[-F][+F]F"
	},
	alpha: 90,
	theta: 35,
	iterCount: 4,
	step: 6
},

"bush 2": {
	axiom: "F",
	rules: {
		F: "FF+[+F-F-F]-[-F+F+F]"
	},
	alpha: 90,
	theta: 22.5,
	iterCount: 4,
	step: 9
},

"sprig": {
	axiom: "X",
	rules: {
		F: "FF",
		X: "F[+X]F[-X]+X"
	},
	alpha: 90,
	theta: 20,
	iterCount: 7,
	step: 2
},

"plant 1": {
	axiom: "X",
	rules: {
		F: "FF",
		X: "F-[[X]+X]+F[+FX]-X"
	},
	alpha: 90,
	theta: 25,
	iterCount: 6,
	step: 3
},

"plant 2": {
	axiom: "F",
	rules: {
		F: "F[+F]F[-F][F]"
	},
	alpha: 90,
	theta: 20,
	iterCount: 5,
	step: 8
},

"plant 3": {
	axiom: "X",
	rules: {
		F: "FF",
		X: "F[+X][-X]FX"
	},
	alpha: 90,
	theta: 25.71,
	iterCount: 6,
	step: 3.5
},

"savine 1": {
	axiom: "F-F[-F+F-F]+[+F-F-F]",
	rules: {
		F: "-F[-F+F-F]+[+F-F-F]-F[-F+F-F]+[+F-F-F]-F[-F+F-F]+[+F-F-F]"
	},
	alpha: 0,
	theta: 20,
	iterCount: 3,
	step: 3
},

"savine 2": {
	axiom: "-[F-F[-F+F-F]+[+F-F-F]]+[F-F[-F+F-F]+[+F-F-F]]",
	rules: {
		F: "-F[-F+F-F]+[+F-F-F]-F[-F+F-F]+[+F-F-F]-F[-F+F-F]+[+F-F-F]"
	},
	alpha: 0,
	theta: 20,
	iterCount: 3,
	step: 3
},

"liana sarment": {
	axiom: "FYX",
	rules: {
		F: "FFFXYFXY-[FFFXYFXY]",
		X: "Y[[XY]+X]+F[+FX]+XF",
		Y: "[FFF[[YX]+Y]+F[+FY]+F]"
	},
	alpha: 90,
	theta: 20,
	iterCount: 4,
	step: 0.5
},

"liana tangle": {
	axiom: "FYX",
	rules: {
		F: "FFFXYFXY-[FFFXYFXY]",
		X: "Y[[XY]+X]+F[+FX]+XF",
		Y: "FFF[[YX]+Y]+F[+FY]+F"
	},
	alpha: 90,
	theta: 20,
	iterCount: 4,
	step: 2
},

"tree": {
	axiom: "F",
	rules: {
		F: "-F[-F+F-F]+[+F-F-F]"
	},
	alpha: 0,
	theta: 20,
	iterCount: 5,
	step: 15
},

"urchin": {
	axiom: "F",
	rules: {
		F: "F[-F+F-F]+[+F-F-F]"
	},
	alpha: 0,
	theta: 20,
	iterCount: 5,
	step: 15
},

"weed": {
	axiom: "F",
	rules: {
		F: "F[+F]F[-F]F"
	},
	alpha: 90,
	theta: 25.714,
	iterCount: 5,
	step: 2
},

"flower 1": {
	axiom: "F[+F+F][-F-F][++F][--F]F",
	rules: {
		F: "FF[++F][+F][F][-F][--F]"
	},
	alpha: 90,
	theta: 11.25,
	iterCount: 3,
	step: 15
},

"dragon": {
	axiom: "FX",
	rules: {
		F: "F",
		X: "X+YF+",
		Y: "-FX-Y"
	},
	alpha: 0,
	theta: 90,
	iterCount: 12,
	step: 5
},

"terdragon": {
	axiom: "F",
	rules: {
		F: "F+F-F"
	},
	alpha: 120,
	theta: 120,
	iterCount: 8,
	step: 6
},

"median dragon": {
	axiom: "-X",
	rules: {
		F: "F",
		X: "X+F+Y",
		Y: "X-F-Y"
	},
	alpha: 0,
	theta: 45,
	iterCount: 12,
	step: 3
},

"Sierpinski carpet": {
	axiom: "FXF--FF--FF",
	rules: {
		F: "FF",
		X: "--FXF++FXF++FXF--",
		Y: "-FX-Y"
	},
	alpha: 0,
	theta: 60,
	iterCount: 5,
	step: 7
},

"Hilbert curve": {
	axiom: "X",
	rules: {
		F: "F",
		X: "-YF+XFX+FY-",
		Y: "+XF-YFY-FX+"
	},
	alpha: 0,
	theta: 90,
	iterCount: 6,
	step: 7
},

"Gosper curve": {
	axiom: "XF",
	rules: {
		F: "F",
		X: "X+YF++YF-FX--FXFX-YF+",
		Y: "-FX+YFYF++YF+FX--FX-Y"
	},
	alpha: 0,
	theta: 60,
	iterCount: 4,
	step: 8
},

"Peano curve": {
	axiom: "F",
	rules: {
		F: "F-F+F+F+F-F-F-F+F"
	},
	alpha: 45,
	theta: 90,
	iterCount: 4,
	step: 8
},

"Sierpinski curve": {
	axiom: "F+FX+F+XF",
	rules: {
		F: "F",
		X: "XF-F+F-XF+F+XF-F+F-X"
	},
	alpha: 45,
	theta: 90,
	iterCount: 4,
	step: 8
},

"Сеsаrо 1": {
	axiom: "F",
	rules: {
		F: "F++++++++++F--------------------F++++++++++F"
	},
	alpha: 180,
	theta: 8,
	iterCount: 6,
	step: 2.9
},

"Сеsаrо 2": {
	axiom: "F+++++++++F------------------F+++++++++F------------------F+++++++++F------------------F+++++++++F------------------F",
	rules: {
		F: "F++++++++F----------------F++++++++F"
	},
	alpha: 0,
	theta: 10,
	iterCount: 5,
	step: 3.5
},

"curve": {
	axiom: "F-F-F-F-",
	rules: {
		F: "FF-F-F-F-F-F+F"
	},
	alpha: 0,
	theta: 90,
	iterCount: 4,
	step: 3.5
},

"cross": {
	axiom: "FX",
	rules: {
		X: "FX+FX+FXFY-FY-",
		Y: "+FX+FXFY-FY-FY"
	},
	alpha: 0,
	theta: 90,
	iterCount: 5,
	step: 4.5
},

"island": {
	axiom: "F+F+F+F",
	rules: {
		F: "F+F-F-FFF+F+F-F"
	},
	alpha: 0,
	theta: 90,
	iterCount: 3,
	step: 4
},

"mosaic": {
	axiom: "F-F-F-F",
	rules: {
		F: "F-B+FF-F-FF-FB-FF+B-FF+F+FF+FB+FFF",
		B: "BBBBBB"
	},
	alpha: 0,
	theta: 90,
	iterCount: 2,
	step: 7
},

"snowflake": {
	axiom: "[F]+[F]+[F]+[F]+[F]+[F]",
	rules: {
		F: "F[++F][-FF]FF[+F][-F]FF"
	},
	alpha: 0,
	theta: 60,
	iterCount: 3,
	step: 2
},

"Koch's snowflake": {
	axiom: "F++F++F",
	rules: {
		F: "F-F++F-F"
	},
	alpha: 0,
	theta: 60,
	iterCount: 4,
	step: 5
},

"Koch's curve": {
	axiom: "F+F+F+F",
	rules: {
		F: "FF+F+F+F+F+F-F"
	},
	alpha: 0,
	theta: 90,
	iterCount: 4,
	step: 3.5
},

"crystal": {
	axiom: "F+F+F+F",
	rules: {
		F: "FF+F++F+F"
	},
	alpha: 0,
	theta: 90,
	iterCount: 4,
	step: 5
},

"chain": {
	axiom: "F+F+F+F",
	rules: {
		F: "F+B-F-FFF+F+B-F",
		B: "BBB"
	},
	alpha: 0,
	theta: 90,
	iterCount: 3,
	step: 4
},

"pentigree": {
	axiom: "F-F-F-F-F",
	rules: {
		F: "F-F++F+F-F-F"
	},
	alpha: 0,
	theta: 72,
	iterCount: 4,
	step: 5
},

"square": {
	axiom: "F+F+F+F",
	rules: {
		F: "FF+F+F+F+FF"
	},
	alpha: 0,
	theta: 90,
	iterCount: 4,
	step: 5
},

"L-system": {
	axiom: "X-X-X-X-X-X-X-X",
	rules: {
		X: "FX+X--X+X--X+X--X+X"
	},
	alpha: 0,
	theta: 40,
	iterCount: 4,
	step: 18
},

"horizons": {
	axiom: "+F++++F",
	rules: {
		F: "F+F+F++++F+F+F"
	},
	alpha: 320.5,
	theta: 40,
	iterCount: 3,
	step: 20
},

"napkin": {
	axiom: "F--F--F--F--F--F",
	rules: {
		F: "-F[--F--F]++F--F+"
	},
	alpha: 0,
	theta: 30,
	iterCount: 4,
	step: 4.5
},

"frame": {
	axiom: "YXY-YXY-YXY-YXY",
	rules: {
		X: "FX+FX+FXFYFX+FXFY-FY-FY-",
		Y: "+FX+FX+FXFY-FYFXFY-FY-FY"
	},
	alpha: 0,
	theta: 90,
	iterCount: 3,
	step: 4
},

"Moore's curl": {
	axiom: "X",
	rules: {
		X: "FX+FX+FXFYFX+FXFY-FY-FY-",
		Y: "+FX+FX+FXFY-FYFXFY-FY-FY"
	},
	alpha: 180,
	theta: 90,
	iterCount: 4,
	step: 3.5
},

"Levi's fractal": {
	axiom: "F",
	rules: {
		F: "+F--F+"
	},
	alpha: 180,
	theta: 45,
	iterCount: 14,
	step: 1.9
},

"Levi's carpet": {
	axiom: "F++F++F++F",
	rules: {
		F: "+F--F+"
	},
	alpha: 180,
	theta: 45,
	iterCount: 14,
	step: 1.8
},

"spiral mosaic": {
	axiom: "AAAA",
	rules: {
		F: "F",
		A: "X+X+X+X+X+X+",
		X: "[F+F+F+F[---X-Y]+++++F++++++++F-F-F-F]",
		Y: "[F+F+F+F[---Y]+++++F++++++++F-F-F-F]"
	},
	alpha: 0,
	theta: 15,
	iterCount: 5,
	step: 10
},

"Krishna's ankle bangle": {
	axiom: "-X--X",
	rules: {
		F: "F",
		X: "XFX--XFX"
	},
	alpha: 0,
	theta: 45,
	iterCount: 5,
	step: 10
},

"mango-tree foliage": {
	axiom: "A---A",
	rules: {
		F: "F",
		B: "B",
		A: "B-F+Z+F-BA",
		Z: "F-FF-F--[--Z]F-FF-F--F-FF-F--"
	},
	alpha: 0,
	theta: 60,
	iterCount: 7,
	step: 15
},

"Pentive": {
	axiom: "Q",
	rules: {
		P: "--FR++++FS--FU",
		Q: "FT++FR----FS++",
		R: "++FP----FQ++FT",
		S: "FU--FP++++FQ--",
		T: "+FU--FP+",
		U: "-FQ++FT-"
	},
	alpha: 36,
	theta: 36,
	iterCount: 7,
	step: 15
},

"Sierpinski median curve": {
	axiom: "L--F--L--F",
	rules: {
		F: "F",
		L: "+R-F-R+",
		R: "-L+F+L-"
	},
	alpha: 0,
	theta: 45,
	iterCount: 10,
	step: 5
},

"lace": {
	axiom: "W",
	rules: {
		F: "F",
		W: "+++X--F--ZFX+",
		X: "---W++F++YFW-",
		Y: "+ZFX--F--Z+++",
		Z: "-YFW++F++Y---"
	},
	alpha: 180,
	theta: 30,
	iterCount: 7,
	step: 4.5
},

"bush 3": {
	axiom: "VZFFF",
	rules: {
		F: "F",
		V: "[+++W][---W]YV",
		W: "+X[-W]Z",
		X: "-W[+X]Z",
		Y: "YZ",
		Z: "[-FFF][+FFF]F"
	},
	alpha: 90,
	theta: 20,
	iterCount: 9,
	step: 10
},

"algae": {
	axiom: "AF",
	rules: {
		A: "FFFFFV[+++H][---Q]BW",
		B: "B",
		C: "FFFFFV[+++BA]BD",
		D: "FFFFFV[+++H][---Q]BE",
		E: "FFFFFV[+++H][---Q]BG",
		F: "F",
		G: "FFFFFV[---BA]BA",
		H: "IBFF",
		I: "BFFF[--M]J",
		J: "BFFF[--N]K",
		K: "BFFF[--O]L",
		L: "BFFF[--P]",
		M: "BFN",
		N: "BFO",
		O: "BFP",
		P: "BF",
		Q: "RBF",
		R: "BFFF[++M]S",
		S: "BFFF[++N]T",
		T: "BFFF[++O]U",
		U: "BFFF[++P]",
		V: "FV",
		W: "FFFFFV[+++H][---Q]BC"
	},
	alpha: 90,
	theta: 12,
	iterCount: 17,
	step: 2
},

"algae 2": {
	axiom: "AF",
	rules: {
		A: "FFFFFY[++++N][----T]BZ",
		B: "B",
		C: "FFFFFY[++++N][----T]BD",
		D: "FFFFFY[++++N][----T]BE",
		E: "FFFFFY[++++N][----T]BG",
		F: "F",
		G: "FFFFFY[+++BA]BH",
		H: "FFFFFY[++++N][----T]BI",
		I: "+FFFFFY[++++N][----T]BJ",
		J: "FFFFFY[++++N][----T]BK",
		K: "-FFFFFY[++++N][----T]BL",
		L: "FFFFFY[++++N][----T]BM",
		M: "FFFFFY[---BA]BA",
		N: "OBFFF",
		O: "BFFFP",
		P: "BFFF[-S]Q",
		Q: "BFFF[-S]R",
		R: "BFFF[-S]",
		S: "BFBF",
		T: "UBFFF",
		U: "BFFFV",
		V: "BFFF[+S]W",
		W: "BFFF[+S]X",
		X: "BFFF[+S]",
		Y: "FY",
		Z: "+FFFFFY[++++N][----T]BC"
	},
	alpha: 90,
	theta: 12,
	iterCount: 17,
	step: 2
},

"Penrose mosaic": {
	axiom: "+WF--XF---YF--ZF",
	rules: {
		W: "YF++ZF----XF[-YF----WF]++",
		X: "+YF--ZF[---WF--XF]+",
		Y: "-WF++XF[+++YF++ZF]-",
		Z: "--YF++++WF[+ZF++++XF]--XF"
	},
	alpha: 270,
	theta: 36,
	iterCount: 6,
	step: 11
},

"hexagonal star": {
	axiom: "S",
	rules: {
		Y: "+",
		Z: "-",
		R: "Z++L-FR-F+R--FR--F+LF++LFYR",
		L: "LZFR--FR-F++LF++L-F+LF+R--Y",
		S: "L"
	},
	alpha: 0,
	theta: 60,
	iterCount: 5,
	step: 12
},

"Penrose tesselation": {
	axiom: "[X]++[X]++[X]++[X]++[X]",
	rules: {
		W: "YF++ZF----XF[-YF----WF]++",
		X: "+YF--ZF[---WF--XF]+",
		Y: "-WF++XF[+++YF++ZF]-",
		Z: "--YF++++WF[+ZF++++XF]--XF"
	},
	alpha: 0,
	theta: 36,
	iterCount: 5,
	step: 20
},

"plant 4": {
	axiom: "--------C",
	rules: {
		F: "F",
		C: "NF[--P]F+C",
		N: "NFF",
		P: "Q",
		Q: "C"
	},
	alpha: 0,
	theta: 11.25,
	iterCount: 20,
	step: 1.2
},

"plant 5": {
	axiom: "----G",
	rules: {
		F: "F",
		G: "GFX[+G][-G]",
		X: "X[-FFF][+FFF]FX"
	},
	alpha: 0,
	theta: 25.7,
	iterCount: 6,
	step: 4
},

"dandelion": {
	axiom: "FF[-Y][Z][+Z]",
	rules: {
		F: "F",
		Y: "FF+F-F-F[FFFZ][+Z]-F-FZ",
		Z: "FF-F+F+F[Y][-Y]+F+FY"
	},
	alpha: 90,
	theta: 15,
	iterCount: 6,
	step: 6
},

"sapling": {
	axiom: "FFFFFFX",
	rules: {
		F: "F",
		X: "FFF-[-F+F[Y]-[X]]+[+F+F[X]-[X]]",
		Y: "FF-[-F+F]+[+F+FY]"
	},
	alpha: 90,
	theta: 15,
	iterCount: 6,
	step: 10
},

"flower 2": {
	axiom: "F-F+F[++X][F+X][F-X][--X]",
	rules: {
		F: "F",
		W: "F-F+F[++X][F+X][F-X][--X]",
		X: "F+FF-F[++Y][+Y][-Z][--Z]",
		Y: "-[Z]F-FF-FF-FF-F[Z]",
		Z: "+[Y]F+FF+FF+FF+F[Y]"
	},
	alpha: 90,
	theta: 10,
	iterCount: 9,
	step: 4.5
},

"Bonsai sprig": {
	axiom: "A",
	rules: {
		F: "F",
		A: "F-FFA+[FAFA+FFF]F"
	},
	alpha: 90,
	theta: 30,
	iterCount: 5,
	step: 7
},

"snowflake2": {
	axiom: "F[X]F++F[X]F++F[X]F++F[X]F",
	rules: {
		X: "[+Y][-Y][++Y][--Y]",
		Y: "YF[X]YF"
	},
	alpha: 0,
	theta: 45,
	iterCount: 9,
	step: 0.9
},

"wheel": {
	axiom: "F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]+F[X]",
	rules: {
		X: "[+++++++++++++Y[X]]-------------Y[X]",
		Y: "YFYF"
	},
	alpha: 0,
	theta: 5,
	iterCount: 7,
	step: 2
}

};

localStorage.lsCollections = JSON.stringify(storedCollections);

})();