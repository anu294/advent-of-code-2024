import * as fs from "fs";
import { map } from "lodash";
import { BitwiseOperator } from "typescript";

const Day17 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input17.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  let program: number[] = [];
  type Operation = {
    operand: number,
    opcode: number,
  };

  class Computer {
    registers: number[];
    originalRegisters: number[];
    program: number[];
    instructionPtr: number;
    outputs: number[];
    constructor(registers: number[]) {
      this.originalRegisters = [...registers];
      this.registers = [...registers];
      this.program = program;
      this.instructionPtr = 0;
      this.outputs = [];
    }

    mapOperandToCombo(operand: number) {
      if (operand < 4) return operand;
      return this.registers[operand-4];
    }

    loadProgram(program: number[]) {
      this.program = program;
    }

    reset() {
      this.registers = [...this.originalRegisters];
      this.instructionPtr = 0;
      this.outputs = [];
    }

    setRegister(registerIndex: number, value: number) {
      this.registers[registerIndex] = value
    }

    runProgram(isCorrupted: boolean = false) {
      while (this.instructionPtr < (this.program.length-1)) {
        const operation: Operation = {opcode: this.program[this.instructionPtr], operand: this.program[this.instructionPtr + 1]};
        this.runOperation(operation);
        if (isCorrupted) {
          const len = this.outputs.length;
          if (this.outputs[len-1] !== this.program[len-1]) break;
        }
        this.instructionPtr+=2;

      }
      return this.outputs;
    }

    runOperation (operation: Operation) {
      const {opcode, operand} = operation; let val = 0;
      // console.log("Operation", opcode, operand, this.registers);
      switch (opcode) {
        //adv
        case 0: {
          val = Math.floor(this.registers[0]/Math.pow(2, this.mapOperandToCombo(operand)));
          this.registers[0] = val;
          break;
        }
        //bxl
        case 1: {
          val = (this.registers[1] ^ operand)>>>0;
          this.registers[1] = val;
          break;
        }
        //bst
        case 2: {
          val = this.mapOperandToCombo(operand) % 8;
          this.registers[1] = val;
          break;
        }
        //jnz
        case 3: {
          if (this.registers[0] !== 0) {
            this.instructionPtr = operand - 2;
          }
          break;
        }
        //bxc
        case 4: {
          val = (this.registers[1] ^ this.registers[2])>>>0;
          this.registers[1] = val;
          break;
        }
        //out
        case 5: {
          this.outputs.push(this.mapOperandToCombo(operand)%8);
          break;
        }
        //bdv
        case 6: {
          val = Math.floor(this.registers[0]/Math.pow(2, this.mapOperandToCombo(operand)));
          this.registers[1] = val;
          break;
        }
        // cdv
        case 7: {
          val = Math.floor(this.registers[0]/Math.pow(2, this.mapOperandToCombo(operand)));
          this.registers[2] = val;
          break;
        }
      }  
    }
  }

  
  const parseInput = (inputStr: string) => {
    const [registersStr, programStr] = inputStr.split("\n\n");
    const registers = registersStr.split("\n").map(r => parseInt(r.split(": ")[1].trim()));
    program = programStr.split(": ")[1].split(",").map(p => parseInt(p));
    return {registers};
  }


  const solve1 = (inputStr: string) => {
    // 0. Parse input
    let {registers} = parseInput(inputStr);

    // 1. Create a computer
    const computer = new Computer(registers);
    // computer.runProgram();
    // 2. Run the program
    const output = computer.runProgram().join(',');
    console.log(registers);
    return output;

  }

  const bruteForce = (inputStr: string) => {
    const max = Math.pow(2, 30);
    // 0. Parse input
    let {registers} = parseInput(inputStr);
    
    // 2. Find output value equals program

    let found = false, iter = 0;
    const s = Math.pow(2, 48) - Math.pow(2, 32);
    const starting =  s -  (s%10)//+ Math.pow(2, 44)+ Math.pow(2, 43) + Math.pow(2, 42); // Until Math.pow(2, 48)
    //+  Math.pow(8, 14) + Math.pow(8, 13) + Math.pow(8, 12) + Math.pow(8, 11) + Math.pow(8, 10) + Math.pow(8, 9) + Math.pow(8, 8) + Math.pow(8, 7) + Math.pow(8, 6) + Math.pow(8, 5) + Math.pow(8, 4) +Math.pow(8, 3) + Math.pow(8, 2) + Math.pow(8, 1) //+ Math.pow(8, 0);
    console.log("Starting", starting);
    while (!found) {
      const computer = new Computer(registers);
      computer.setRegister(0, starting+iter);
      // console.log("BEfore", (starting+iter), computer.registers);
      const output = computer.runProgram(true).join(',');
      //console.log("output", (starting+iter), computer.registers, output);
      if (output.length === program.length && output === program.join(",")) {
        // console.log("Found", registers[0]+iter, output);  
        found = true;
      } else {
        registers[0]++;
      }
      iter++;
      if(iter>max) {console.log("HEY it only broke");break};
    }

    return starting+iter-1;

  }

  /*
  * This fn works specifically for input 2,4,1,1,7,5,1,5,4,5,0,3,5,5,3,0
  * 1. This seq updates A only once with the value of A = A/8
  * 2. The sequence ends with 3,0 which means that as long as A is divisible by 8 > 0 the ptr will be reset to 0
  * 2. This seq assumes that the initial value of B and C don't matter when program begins to run
  * 3. B is always starts with getting the last 3 bits of A and then a few updates (1^B, B^C, B^5)
  * 3. The output is always going to be the value of B%8, which means that only the last 3 bits of B matter
  * 
  * So yes we could technically be searching for a value of A as A*8 +23.
  * But the lowest initial value of A is A*8 +i where i is in range [0,8]
  */
  const backwardCalcA = (computer:Computer, programPtr: number): number | null => {
    if (programPtr < 0) return computer.registers[0];
    for (let i = 0; i < 8; i++) {
      const valueOfA = computer.registers[0] * 8 + i;
      const newComputer = new Computer([valueOfA, ...computer.registers.slice(1)]);

      if (newComputer.runProgram()[0] === newComputer.program[programPtr]) {
        newComputer.reset();
        const e = backwardCalcA(newComputer, programPtr - 1);
        if (e !== null) return e;
      }
    }
    return null;
  };
  

  const solve2 = (inputStr: string) => {
    // 0. Parse input
    let {registers} = parseInput(inputStr);
    // 1. Create a computer
    const computer = new Computer(registers);
    computer.setRegister(0, 0);
    // 3. Recursively find the value of register A
    return backwardCalcA(computer, program.length - 1);
  }


  const main = (inputString: string) => {
    console.log("Day 15: Part 1: ", solve1(inputString));
    console.time();
    console.log("Day 15: Part 2: ", solve2(inputString));
    console.timeEnd();
  };

  readInput();
};

Day17();