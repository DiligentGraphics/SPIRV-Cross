#pragma clang diagnostic ignored "-Wmissing-prototypes"
#pragma clang diagnostic ignored "-Wmissing-braces"
#pragma clang diagnostic ignored "-Wunused-variable"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float FragColor [[color(0)]];
};

inline uint4 spvSubgroupBallot(bool value)
{
    simd_vote vote = simd_ballot(value);
    // simd_ballot() returns a 64-bit integer-like object, but
    // SPIR-V callers expect a uint4. We must convert.
    // FIXME: This won't include higher bits if Apple ever supports
    // 128 lanes in an SIMD-group.
    return uint4((uint)((simd_vote::vote_t)vote & 0xFFFFFFFF), (uint)(((simd_vote::vote_t)vote >> 32) & 0xFFFFFFFF), 0, 0);
}

inline bool spvSubgroupBallotBitExtract(uint4 ballot, uint bit)
{
    return !!extract_bits(ballot[bit / 32], bit % 32, 1);
}

inline uint spvSubgroupBallotFindLSB(uint4 ballot)
{
    return select(ctz(ballot.x), select(32 + ctz(ballot.y), select(64 + ctz(ballot.z), select(96 + ctz(ballot.w), uint(-1), ballot.w == 0), ballot.z == 0), ballot.y == 0), ballot.x == 0);
}

inline uint spvSubgroupBallotFindMSB(uint4 ballot)
{
    return select(128 - (clz(ballot.w) + 1), select(96 - (clz(ballot.z) + 1), select(64 - (clz(ballot.y) + 1), select(32 - (clz(ballot.x) + 1), uint(-1), ballot.x == 0), ballot.y == 0), ballot.z == 0), ballot.w == 0);
}

inline uint spvSubgroupBallotBitCount(uint4 ballot)
{
    return popcount(ballot.x) + popcount(ballot.y) + popcount(ballot.z) + popcount(ballot.w);
}

inline uint spvSubgroupBallotInclusiveBitCount(uint4 ballot, uint gl_SubgroupInvocationID)
{
    uint4 mask = uint4(extract_bits(0xFFFFFFFF, 0, min(gl_SubgroupInvocationID + 1, 32u)), extract_bits(0xFFFFFFFF, 0, (uint)max((int)gl_SubgroupInvocationID + 1 - 32, 0)), uint2(0));
    return spvSubgroupBallotBitCount(ballot & mask);
}

inline uint spvSubgroupBallotExclusiveBitCount(uint4 ballot, uint gl_SubgroupInvocationID)
{
    uint4 mask = uint4(extract_bits(0xFFFFFFFF, 0, min(gl_SubgroupInvocationID, 32u)), extract_bits(0xFFFFFFFF, 0, (uint)max((int)gl_SubgroupInvocationID - 32, 0)), uint2(0));
    return spvSubgroupBallotBitCount(ballot & mask);
}

template<typename T>
inline bool spvSubgroupAllEqual(T value)
{
    return simd_all(value == simd_broadcast_first(value));
}

template<>
inline bool spvSubgroupAllEqual(bool value)
{
    return simd_all(value) || !simd_any(value);
}

fragment main0_out main0()
{
    main0_out out = {};
    uint gl_SubgroupSize = simd_sum(1);
    uint gl_SubgroupInvocationID = simd_prefix_exclusive_sum(1);
    uint4 gl_SubgroupEqMask = gl_SubgroupInvocationID > 32 ? uint4(0, (1 << (gl_SubgroupInvocationID - 32)), uint2(0)) : uint4(1 << gl_SubgroupInvocationID, uint3(0));
    uint4 gl_SubgroupGeMask = uint4(extract_bits(0xFFFFFFFF, min(gl_SubgroupInvocationID, 32u), (uint)max(min((int)gl_SubgroupSize, 32) - (int)gl_SubgroupInvocationID, 0)), extract_bits(0xFFFFFFFF, (uint)max((int)gl_SubgroupInvocationID - 32, 0), (uint)max((int)gl_SubgroupSize - (int)max(gl_SubgroupInvocationID, 32u), 0)), uint2(0));
    uint4 gl_SubgroupGtMask = uint4(extract_bits(0xFFFFFFFF, min(gl_SubgroupInvocationID + 1, 32u), (uint)max(min((int)gl_SubgroupSize, 32) - (int)gl_SubgroupInvocationID - 1, 0)), extract_bits(0xFFFFFFFF, (uint)max((int)gl_SubgroupInvocationID + 1 - 32, 0), (uint)max((int)gl_SubgroupSize - (int)max(gl_SubgroupInvocationID + 1, 32u), 0)), uint2(0));
    uint4 gl_SubgroupLeMask = uint4(extract_bits(0xFFFFFFFF, 0, min(gl_SubgroupInvocationID + 1, 32u)), extract_bits(0xFFFFFFFF, 0, (uint)max((int)gl_SubgroupInvocationID + 1 - 32, 0)), uint2(0));
    uint4 gl_SubgroupLtMask = uint4(extract_bits(0xFFFFFFFF, 0, min(gl_SubgroupInvocationID, 32u)), extract_bits(0xFFFFFFFF, 0, (uint)max((int)gl_SubgroupInvocationID - 32, 0)), uint2(0));
    out.FragColor = float(gl_SubgroupSize);
    out.FragColor = float(gl_SubgroupInvocationID);
    out.FragColor = float4(gl_SubgroupEqMask).x;
    out.FragColor = float4(gl_SubgroupGeMask).x;
    out.FragColor = float4(gl_SubgroupGtMask).x;
    out.FragColor = float4(gl_SubgroupLeMask).x;
    out.FragColor = float4(gl_SubgroupLtMask).x;
    uint4 _63 = spvSubgroupBallot(true);
    float4 _147 = simd_prefix_inclusive_product(simd_product(float4(20.0)));
    int4 _149 = simd_prefix_inclusive_product(simd_product(int4(20)));
    return out;
}

