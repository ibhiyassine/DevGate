.data
# 2x3 matrices
matrix1: .word 10, 20, 30, 40, 50, 60  
matrix2: .word 1, 2, 3, 4, 5, 6  
matrix3: .word 0, 0, 0, 0, 0, 0   # Matrix to store results
space: .string " "    # Space character for formatting
newline: .string "\n" # Newline character

.text
.globl main
main:
    la x5, matrix1      # Load base address of matrix1 into x5
    la x6, matrix2      # Load base address of matrix2 into x6
    la x7, matrix3      # Load base address of matrix3 into x7
    addi x28, x0, 0     # i = 0
    li x29, 3           # num_cols = 3 (3 columns)
    li x12, 2           # num_rows = 2 (2 rows)
    
loop1:                  # Outer loop (for rows)
    beq x28, x12, Exit  # Exit if i == num_rows
    addi x8, x0, 0      # j = 0 (reset column index)
    
loop2:                  # Inner loop (for columns)
    beq x8, x29, increment  # Exit if j == num_cols
    
    # Calculate offset for element (i * num_cols + j) * 4
    mul x30, x28, x29   # x30 = i * num_cols
    add x30, x30, x8    # x30 = i * num_cols + j
    slli x30, x30, 2    # x30 = (i * num_cols + j) * 4 (word offset)

    # Load element from matrix1[i][j]
    add x9, x5, x30     # x9 = base address of matrix1 + offset
    lw x10, 0(x9)       # x10 = matrix1[i][j]

    # Load element from matrix2[i][j]
    add x9, x6, x30     # x9 = base address of matrix2 + offset
    lw x11, 0(x9)       # x11 = matrix2[i][j]

    # Add the two elements
    add x10, x10, x11   # x10 = matrix1[i][j] + matrix2[i][j]

    # Print the result of the addition
    mv a0, x10          # Move the result to a0 for printing
    li a7, 1            # Syscall for print integer
    ecall               # Print the result of addition

    # Print space after each number
    la a0, space        # Load address of space string
    li a7, 4            # Syscall for print string
    ecall

    # Store the result in matrix3[i][j]
    add x9, x7, x30     # x9 = base address of matrix3 + offset
    sw x10, 0(x9)       # matrix3[i][j] = result

    addi x8, x8, 1      # Increment column index j
    j loop2             # Jump back to inner loop
    
increment:             # Increment row index
    # Print newline after each row
    la a0, newline     # Load address of newline string
    li a7, 4           # Syscall for print string
    ecall
    
    addi x28, x28, 1    # i = i + 1
    j loop1             # Jump back to outer loop

Exit:                  # Exit program
    li a7, 10           # Syscall for exit
    ecall 