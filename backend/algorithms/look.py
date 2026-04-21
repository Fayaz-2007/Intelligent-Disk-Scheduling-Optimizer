"""LOOK disk scheduling algorithm."""


def look(requests: list, head: int, direction: str = "right") -> dict:
    """
    Like SCAN but the head only goes as far as the last request in each
    direction (never to the disk boundary).
    """
    if not requests:
        return {"sequence": [head], "total_movement": 0}

    sorted_requests = sorted(set(requests))
    left = [r for r in sorted_requests if r < head]
    right = [r for r in sorted_requests if r >= head]

    sequence = [head]
    if direction == "right":
        path = right + list(reversed(left))
    else:  # left
        path = list(reversed(left)) + right

    total_movement = 0
    for target in path:
        total_movement += abs(target - sequence[-1])
        sequence.append(target)

    return {"sequence": sequence, "total_movement": total_movement}
