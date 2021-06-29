export class LagrangeFraction {
  minuxX : number;
  denominator : number;
	constructor(minuxX : number, denominator : number) {
		this.minuxX = minuxX;
		this.denominator = denominator - minuxX;
	}

	F(x : number) {
		return (x - this.minuxX) / this.denominator;
	}
}
