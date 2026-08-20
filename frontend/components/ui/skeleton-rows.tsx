export function SkeletonRows({
	columns,
	rows = 3,
}: {
	columns: number;
	rows?: number;
}) {
	return (
		<>
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<tr key={rowIndex} className="border-b border-white/5">
					{Array.from({ length: columns }).map((_, colIndex) => (
						<td key={colIndex} className="px-5 py-3.5">
							<div
								className="h-4 animate-pulse rounded-md bg-white/10"
								style={{
									width: `${60 + ((rowIndex + colIndex) % 3) * 15}%`,
								}}
							/>
						</td>
					))}
				</tr>
			))}
		</>
	);
}
