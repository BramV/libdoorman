#ifndef _DOORMAN_H
#define _DOORMAN_H 1

namespace doorman {

void setupRead(int);
void setupWrite(int);

int read();
void write(int);

void sleep();

};

#endif // _DOORMAN_H
