#include "shell.h"

/**
 * @brief Launch a program and wait for it to terminate.
 * @param args Null terminated list of arguments (including program).
 * @param redir_file Optional file for output redirection.
 * @return 1 if the shell should continue running, 0 otherwise.
 */
int shell_launch(char **args, char *redir_file) {
  pid_t pid;
  int status;

  pid = fork();
  if (pid == 0) {
    // Child process
    if (redir_file != NULL) {
      int fd = open(redir_file, O_WRONLY | O_CREAT | O_TRUNC, 0644);
      if (fd < 0) {
        perror("cse_shell: open");
        exit(EXIT_FAILURE);
      }
      if (dup2(fd, STDOUT_FILENO) < 0) {
        perror("cse_shell: dup2");
        exit(EXIT_FAILURE);
      }
      close(fd);
    }

    if (execvp(args[0], args) == -1) {
      perror("cse_shell");
    }
    exit(EXIT_FAILURE);
  } else if (pid < 0) {
    // Error forking
    perror("cse_shell");
  } else {
    // Parent process
    do {
      waitpid(pid, &status, WUNTRACED);
    } while (!WIFEXITED(status) && !WIFSIGNALED(status));
  }

  return 1;
}

/**
 * @brief Execute shell built-in or launch program.
 * @param args Null terminated list of arguments.
 * @return 1 if the shell should continue running, 0 otherwise.
 */
int shell_execute(char **args) {
  int i;

  if (args[0] == NULL) {
    // Empty command
    return 1;
  }

  // Handle Redirection logic (simple check for '>')
  char *redir_file = NULL;
  for (i = 0; args[i] != NULL; i++) {
    if (strcmp(args[i], ">") == 0) {
      if (args[i+1] == NULL) {
        fprintf(stderr, "cse_shell: expected file after '>'\n");
        return 1;
      }
      redir_file = args[i+1];
      args[i] = NULL; // Terminate args before the '>'
      break;
    }
  }

  for (i = 0; i < shell_num_builtins(); i++) {
    if (strcmp(args[0], builtin_str[i]) == 0) {
      return (*builtin_func[i])(args);
    }
  }

  return shell_launch(args, redir_file);
}
