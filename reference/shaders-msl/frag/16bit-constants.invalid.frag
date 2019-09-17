#pragma clang diagnostic ignored "-Wmissing-braces"
#pragma clang diagnostic ignored "-Wunused-variable"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    half foo [[color(0)]];
    short bar [[color(1)]];
    ushort baz [[color(2)]];
};

fragment main0_out main0()
{
    main0_out out = {};
    out.foo = half(1.0);
    out.bar = 2;
    out.baz = 3u;
    return out;
}

