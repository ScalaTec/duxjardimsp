type Props = { title: string };
export default function Placeholder({ title }: Props) {
  return <main className="screen"><h1>{title}</h1></main>;
}
