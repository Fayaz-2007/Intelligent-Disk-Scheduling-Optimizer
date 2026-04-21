"""Shortest Seek Time First disk scheduling algorithm."""


def sstf(requests: list, head: int) -> dict:
    """At each step, pick the request closest to the current head position."""
    if not requests:
        return {"sequence": [head], "total_movement": 0}

    remaining = list(requests)
    sequence = [head]
    current = head
    total_movement = 0

    while remaining:
        closest = min(remaining, key=lambda r: abs(r - current))
        total_movement += abs(closest - current)
        current = closest
        sequence.append(current)
        remaining.remove(closest)

    return {"sequence": sequence, "total_movement": total_movement}
