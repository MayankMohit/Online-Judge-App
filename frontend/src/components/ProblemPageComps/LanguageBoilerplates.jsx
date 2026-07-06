export const languageBoilerplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`,
  python: `def main():
    # Write your code here
    pass

if __name__ == "__main__":
    main()`,
  javascript: `// All of stdin is available in the "input" string (already read for you).
// e.g. two numbers on a line:  const [a, b] = input.split(/\\s+/).map(Number);
// e.g. multiple lines:         const lines = input.split("\\n");

function main() {
  // Write your code here
}

main();`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  go: `package main

import "fmt"

func main() {
    // Write your code here
    _ = fmt.Sprint
}`,
  rust: `use std::io::*;

fn main() {
    // Write your code here
}`,
};