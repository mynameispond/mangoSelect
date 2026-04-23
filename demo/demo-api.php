<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$keyword = '';
$option = '';
$customer = '';
$branch = '';
$grouped = false;
$page = 1;
$perPage = 50;
$departments = [
    'Sales',
    'Marketing',
    'Support',
    'Warehouse',
    'Finance',
    'HR',
    'Logistics',
    'Product'
];
$firstNames = [
    'Ava',
    'Noah',
    'Mia',
    'Liam',
    'Emma',
    'Lucas',
    'Ivy',
    'Mason',
    'Ella',
    'Ethan',
    'Nora',
    'Owen'
];
$lastNames = [
    'Smith',
    'Johnson',
    'Brown',
    'Davis',
    'Wilson',
    'Miller',
    'Taylor',
    'Anderson',
    'Thomas',
    'Jackson'
];
$allItems = [];

if (isset($_GET['search']) && $_GET['search'] !== '') {
    $keyword = (string) $_GET['search'];
}

if (isset($_GET['option']) && $_GET['option'] !== '') {
    $option = (string) $_GET['option'];
}

if (isset($_GET['customer']) && $_GET['customer'] !== '') {
    $customer = (string) $_GET['customer'];
}

if (isset($_GET['branch']) && $_GET['branch'] !== '') {
    $branch = (string) $_GET['branch'];
}

if (isset($_GET['grouped']) && $_GET['grouped'] === '1') {
    $grouped = true;
}

if (isset($_GET['page_num'])) {
    $page = max(1, (int) $_GET['page_num']);
}

if (isset($_GET['per_page'])) {
    $perPage = max(1, (int) $_GET['per_page']);
}

for ($index = 1; $index <= 120; $index += 1) {
    $idPrefix = $option === 'owner' ? 'own-' : 'emp-';
    $roleName = $departments[($index - 1) % count($departments)];
    $metaParts = [];
    $badgeCount = ($index % 4) + 1;
    $badgeClass = $index % 2 === 0
        ? 'demo-api-chip demo-api-chip--red'
        : 'demo-api-chip demo-api-chip--blue';

    if ($option === 'owner') {
        $roleName = 'Owner / ' . $roleName;
    }

    if ($customer !== '') {
        $metaParts[] = 'Customer ' . $customer;
    }

    if ($branch !== '') {
        $metaParts[] = strtoupper($branch);
    }

    $id = $idPrefix . str_pad((string) $index, 3, '0', STR_PAD_LEFT);
    $text =
        strtoupper($id) .
        ' / ' .
        $firstNames[($index - 1) % count($firstNames)] .
        ' ' .
        $lastNames[($index - 1) % count($lastNames)] .
        ' / ' .
        $roleName;

    if ($metaParts !== []) {
        $text .= ' / ' . implode(' / ', $metaParts);
    }

    $item = [
        'id' => $id,
        'text' => $text,
        'html' =>
            '<span class="demo-api-row">' .
            '<span class="demo-api-row-label">' .
            htmlspecialchars($text, ENT_QUOTES, 'UTF-8') .
            '</span>' .
            '<span class="' .
            $badgeClass .
            '">' .
            $badgeCount .
            '</span>' .
            '</span>',
        'group' => $roleName
    ];

    if ($index % 13 === 0) {
        $item['disabled'] = true;
    }

    $allItems[] = $item;
}

if ($keyword !== '') {
    $keywordLower = strtolower($keyword);

    $allItems = array_values(array_filter($allItems, static function (array $item) use ($keywordLower): bool {
        return strpos(strtolower($item['id']), $keywordLower) !== false
            || strpos(strtolower($item['text']), $keywordLower) !== false;
    }));
}

$totals = count($allItems);
$offset = ($page - 1) * $perPage;
$pageItems = array_slice($allItems, $offset, $perPage);
$normalizeItem = static function (array $item): array {
    $normalized = [
        'id' => $item['id'],
        'text' => $item['text']
    ];

    if (isset($item['html']) && $item['html'] !== '') {
        $normalized['html'] = $item['html'];
    }

    if (!empty($item['disabled'])) {
        $normalized['disabled'] = true;
    }

    return $normalized;
};

if ($grouped) {
    $groupedItems = [];

    foreach ($pageItems as $item) {
        $groupLabel = isset($item['group']) && $item['group'] !== ''
            ? (string) $item['group']
            : 'Other';

        if (!isset($groupedItems[$groupLabel])) {
            $groupedItems[$groupLabel] = [
                'text' => $groupLabel,
                'html' => '<div class="demo-api-group-label">' .
                    htmlspecialchars($groupLabel, ENT_QUOTES, 'UTF-8') .
                    '</div>',
                'children' => []
            ];
        }

        $groupedItems[$groupLabel]['children'][] = $normalizeItem($item);
    }

    $pageItems = array_values($groupedItems);
} else {
    $pageItems = array_map($normalizeItem, $pageItems);
}

echo json_encode([
    'results' => $pageItems,
    'totals' => $totals
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
