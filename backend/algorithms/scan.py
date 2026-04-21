"""SCAN (Elevator) disk scheduling algorithm."""


def scan(requests: list, head: int, disk_size: int = 200, direction: str = "right") -> dict:
    """
    Head moves in one direction servicing requests until it reaches the end
    of the disk (disk_size - 1 or 0), then reverses direction.
    """
    if not requests:
        return {"sequence": [head], "total_movement": 0}

    sorted_requests = sorted(set(requests))
    left = [r for r in sorted_requests if r < head]
    right = [r for r in sorted_requests if r >= head]

    sequence = [head]
    if direction == "right":
        path = right + [disk_size - 1] + list(reversed(left))
    else:  # left
        path = list(reversed(left)) + [0] + right

    total_movement = 0
    for target in path:
        total_movement += abs(target - sequence[-1])
        sequence.append(target)

    return {"sequence": sequence, "total_movement": total_movement}
