#include <iostream>
#include <omp.h>

int main() {
    int thread_count = 0;

    #pragma omp parallel reduction(+:thread_count)
    {
        thread_count += 1;
    }

    std::cout << "OpenMP is working." << std::endl;
    std::cout << "Threads detected: " << thread_count << std::endl;

    return 0;
}
