"""First Come First Serve disk scheduling algorithm."""


def fcfs(requests: list, head: int) -> dict:
    """Service requests in the exact order they arrive."""
    if not requests:
        return {"sequence": [head], "total_movement": 0}

    sequence = [head] + list(requests)
    total_movement = 0
    for i in range(1, len(sequence)):
        total_movement += abs(sequence[i] - sequence[i - 1])

    return {"sequence": sequence, "total_movement": total_movement}
