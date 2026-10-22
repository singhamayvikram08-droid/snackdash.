#ifndef SHELL_H
#define SHELL_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <fcntl.h>

/* Function Declarations for Built-in Commands */
int shell_cd(char **args);
int shell_help(char **args);
int shell_exit(char **args);

/* Function Declarations for Core Logic */
char *shell_read_line(void);
char **shell_split_line(char *line);
int shell_execute(char **args);
int shell_launch(char **args, char *redir_file);

/* List of built-in commands and their corresponding functions */
extern char *builtin_str[];
extern int (*builtin_func[]) (char **);
int shell_num_builtins();

#endif
