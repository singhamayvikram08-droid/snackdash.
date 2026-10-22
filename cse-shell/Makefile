CC=gcc
CFLAGS=-Wall -Wextra -g
OBJ=main.o builtins.o execute.o
DEPS=shell.h

%.o: %.c $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)

cse_shell: $(OBJ)
	$(CC) -o $@ $^ $(CFLAGS)

.PHONY: clean

clean:
	rm -f *.o cse_shell
